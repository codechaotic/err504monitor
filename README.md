### Error Monitor

Cron task for monitoring errors returned from the mindfire api.

### Setup

1. Install dependencies with `npm install`
2. Create an account and API key on sendgrid if you don't have one
3. Run the cron task with the following command.

```bash
$> API_KEY=yourkey MF_USER=email MF_PASS=password npm start
```

### Configuration

Modify the values at the top of `run.js` to modify the behavior of the task.

**TO** / **TONAMES** - Add names and emails to these lists to send error notifications.

**SIZE** - Change the number of contacts requested with each iteration.

**RATE** - Change the number of milliseconds between requests.
