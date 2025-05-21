# Mr. R Sushi Deployment Guide

This document provides information about the deployment setup for Mr. R Sushi application.

## Architecture Overview

The application consists of two main components:

1. **Frontend**: React application served from `/var/www/html`
2. **Backend**: ASP.NET Core API running as a systemd service at `/var/www/api`

Both are deployed to the same EC2 instance and are accessible via the domain `sushi.jobjourney.me`.

## Deployment Process

The deployment is automated using GitHub Actions workflow defined in `.github/workflows/deploy.yml`. When code is pushed to the `main` branch, it triggers:

1. **Building the frontend**: Compiles the React application
2. **Building the backend**: Publishes the ASP.NET Core API
3. **Deploying to EC2**: Transfers both components to the EC2 instance and configures them

## Infrastructure

### EC2 Setup

The following components are set up on the EC2 instance:

1. **Nginx**: Web server that serves the frontend and proxies API requests to the backend
2. **ASP.NET Core Runtime**: Required to run the backend API
3. **SSL Certificates**: Configured in Nginx for HTTPS

### Directory Structure

- `/var/www/html`: Contains the frontend files
- `/var/www/api`: Contains the backend API files
- `/etc/nginx/conf.d/default.conf`: Nginx configuration
- `/etc/systemd/system/mrrsushi-api.service`: Systemd service configuration for the API

## Configuration Files

### Nginx Configuration

The Nginx configuration is set up to:

- Redirect HTTP to HTTPS
- Serve frontend files from `/var/www/html`
- Proxy requests to `/api/*` to the backend running on localhost:5000

### Systemd Service

The backend API runs as a systemd service configured to:

- Start automatically on system boot
- Restart automatically if it crashes
- Run as the ec2-user

## Maintenance Tasks

### Viewing Logs

To view logs for the backend API:

```bash
sudo journalctl -u mrrsushi-api.service
```

To view Nginx logs:

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restarting Services

To restart the backend API:

```bash
sudo systemctl restart mrrsushi-api.service
```

To restart Nginx:

```bash
sudo systemctl restart nginx
```

### Database Location

The SQLite database is stored at `/var/www/api/MrRSushi.db`. To back it up:

```bash
cp /var/www/api/MrRSushi.db /var/www/api/MrRSushi.db.bak
```

## Security Considerations

- Ensure that the EC2 security group allows traffic on ports 80 (HTTP) and 443 (HTTPS)
- The API is not directly accessible from the public internet, only through the Nginx proxy
- SSL certificates should be renewed as needed

## Troubleshooting

If the application is not working properly, check:

1. **Service Status**:

   ```bash
   sudo systemctl status mrrsushi-api.service
   sudo systemctl status nginx
   ```

2. **Logs**:

   ```bash
   sudo journalctl -u mrrsushi-api.service
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Connectivity**:
   ```bash
   curl -v http://localhost:5000/api/health
   curl -v -k https://localhost/api/health
   ```

## Email Notifications

Order confirmations are sent via Gmail SMTP to the configured email address in `EmailService.cs`. If you need to change the email configuration, update the file and redeploy.
