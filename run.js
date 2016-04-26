var sendgrid = require('sendgrid')(API_KEY);
var mindfire = require('@ccsm/mindfire');
var API_KEY = process.env.API_KEY; // Sendgrid API Key
var MF_USER = process.env.MF_USER; // Mindfire User Email
var MF_PASS = process.env.MF_PASS; // Mindfire User Password

var TO = [
  /* List of Emails to send err reports to */
];
var TONAMES = [
  /* List of Contact names matching same index in TO array */
]

var SIZE = 5000;  /* Number of contacts to request */
var RATE = 30000; /* Number of seconds to wait between requests */

var sendgrid = require('sendgrid')(API_KEY);
var mindfire = require('@ccsm/mindfire');

mindfire.config({
  timeout: 120000,
  request_delay: 4000,  // max 15 requests / minute
  retry_delay: 20000,
  maxRequests: 15,
  retry: 0
});

var config = {
  account: 2241,
  metric: 20102,
  metric_type: 1,
  count: true,
  page: 0,
  page_size: SIZE,
  scope: 1,
  scope_type: 3,
  service_type: 201,
  from: '10/8/2015',
  to: '4/25/2016',
  fields: 'id',
};

var data = {
  Filter: config.filter || '',
  InsideFilter: config.search || '',
  OrderByClause: config.orderBy || "id desc",
  ProcessRequest_ID: 0,
  ReturnCount: config.count?1:0,
  ai: config.account,
  eo: config.options || "",
  fd: config.from || "1/1/1000",
  fields: config.fields || 'id',
  g: config.goal || 0,
  m: config.metric || 0,
  mt: config.metric_type || 0,
  pageIndex: config.page || 0,
  pageSize: config.page_size || 0,
  requestCount: 0,
  s: 0,
  sct: config.scope_type || 0,
  seed: !!config.seed,
  si: config.scope || 0,
  st: config.service_type || 0,
  td: config.to || "1/1/9999"
};

go();
var task = setInterval(go, RATE)

function fn() {
  var date = new Date();
  return date.toLocaleString('en-US', { hour12: false })
}

function go() {
  var start = new Date();
  var requestTime;
  var runtime = () => { return (new Date() - start) }
  mindfire.connect(MF_USER, MF_PASS)
  .then(function(mf) {
    requestTime = runtime();
    return mf.getContactListData(config);
  })
  .then(function(data) {
    console.log(fn()+',', 'Success!, ', runtime()/1000);
  })
  .catch(function(err) {
    notify(requestTime, runtime, err.message);
  })
};

function notify(requestTime, runtime, msg) {
  try {
    var errTime = (runtime() - requestTime)/1000;
    console.log(fn()+',', msg+',', errTime);
    var email = new sendgrid.Email({
      to: TO,
      toname: TONAME,
      from: 'noreply@oneclearchoice.com',
      fromname: 'Clark Communications',
      subject: 'Error '+msg.split(':')[0],
      text: msg.split(':')[1] + ' after '+errTime+' seconds',
      html: [
        'ERROR '+msg,
        'DATE '+fn(),
        'TIME, '+errTime+' seconds',
        '',
        'POST  '+'https://studio.dashboard.mdl.io/api/report/GetContactListData/',
        'QUERY '+"ai=2241, token=SessionToken",
        'JSON  ',
        ''
      ].join("<br />")+JSON.stringify(data,'','  '),
    })
    sendgrid.send(email, function(err, json) {
      if (err) { console.log(fn()+',', err, runtime()/1000); }
    });
  } catch(e) {
    console.log(fn()+',', 'Email Failed, ', runtime()/1000);
  }

}

process.on( 'SIGINT', function() {
  clearInterval(task);
});
