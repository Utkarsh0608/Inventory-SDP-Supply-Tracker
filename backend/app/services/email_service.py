"""
Email service for sending notifications
Handles SMTP email sending for approvals, rejections, and alerts
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EmailService:
    """Service to handle email notifications"""
    
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_user)
    
    def send_email(self, to_email: str, subject: str, body: str, html_body: str = None):
        """
        Send an email using SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Plain text body
            html_body: HTML body (optional)
        """
        if not self.smtp_user or not self.smtp_password:
            print("[WARNING] SMTP credentials not configured. Email not sent.")
            return False
        
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add plain text version
            msg.attach(MIMEText(body, 'plain'))
            
            # Add HTML version if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))
            
            # Connect to SMTP server
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            
            # Send email
            server.send_message(msg)
            server.quit()
            
            print(f"[OK] Email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"[ERROR] Failed to send email to {to_email}: {e}")
            return False
    
    def send_request_approval_notification(self, user_email: str, user_name: str, request_id: int, items: List[dict]):
        """
        Send notification when request is approved
        
        Args:
            user_email: SDP user email
            user_name: SDP user name
            request_id: Request ID
            items: List of approved items with details
        """
        subject = f"Request #{request_id} Approved - Inventory Update"
        
        body = f"""
Dear {user_name},

Your request #{request_id} has been approved!

Approved Items:
{chr(10).join([f"- {item['name']}: {item['quantity']} units" for item in items])}

The items have been dispatched to your Service Delivery Point.

Best regards,
Inventory Management System
        """
        
        html_body = f"""
<html>
<body>
<h2>Request Approved</h2>
<p>Dear {user_name},</p>
<p>Your request <strong>#{request_id}</strong> has been approved!</p>
<h3>Approved Items:</h3>
<table border="1" cellpadding="5" cellspacing="0">
<tr><th>Item</th><th>Quantity</th></tr>
{''.join([f'<tr><td>{item["name"]}</td><td>{item["quantity"]}</td></tr>' for item in items])}
</table>
<p>The items have been dispatched to your Service Delivery Point.</p>
<p><strong>Best regards,</strong><br>Inventory Management System</p>
</body>
</html>
        """
        
        return self.send_email(user_email, subject, body, html_body)
    
    def send_request_rejection_notification(self, user_email: str, user_name: str, request_id: int, reason: str = None):
        """
        Send notification when request is rejected
        
        Args:
            user_email: SDP user email
            user_name: SDP user name
            request_id: Request ID
            reason: Rejection reason (optional)
        """
        subject = f"Request #{request_id} Rejected - Inventory Update"
        
        body = f"""
Dear {user_name},

Your request #{request_id} has been rejected.

{f'Reason: {reason}' if reason else ''}

Please contact the administrator if you have any questions.

Best regards,
Inventory Management System
        """
        
        html_body = f"""
<html>
<body>
<h2>Request Rejected</h2>
<p>Dear {user_name},</p>
<p>Your request <strong>#{request_id}</strong> has been rejected.</p>
{f'<p><strong>Reason:</strong> {reason}</p>' if reason else ''}
<p>Please contact the administrator if you have any questions.</p>
<p><strong>Best regards,</strong><br>Inventory Management System</p>
</body>
</html>
        """
        
        return self.send_email(user_email, subject, body, html_body)
    
    def send_low_stock_alert(self, admin_email: str, low_stock_items: List[dict]):
        """
        Send low stock alert to admin
        
        Args:
            admin_email: Admin email address
            low_stock_items: List of low stock items
        """
        subject = f"Low Stock Alert - {len(low_stock_items)} Items Below Threshold"
        
        body = f"""
Low Stock Alert

The following items are at or below their threshold:

{chr(10).join([f"- {item['item_name']}: {item['quantity']}/{item['threshold']} (shortage: {item['shortage']})" for item in low_stock_items])}

Please take necessary action to restock these items.

Best regards,
Inventory Management System
        """
        
        html_body = f"""
<html>
<body>
<h2>Low Stock Alert</h2>
<p>The following items are at or below their threshold:</p>
<table border="1" cellpadding="5" cellspacing="0">
<tr><th>Item</th><th>Current Qty</th><th>Threshold</th><th>Shortage</th><th>Severity</th></tr>
{''.join([f'<tr><td>{item["item_name"]}</td><td>{item["current_quantity"]}</td><td>{item["threshold"]}</td><td>{item["shortage"]}</td><td style="color: {"red" if item["severity"] == "critical" else "orange"}">{item["severity"].upper()}</td></tr>' for item in low_stock_items])}
</table>
<p>Please take necessary action to restock these items.</p>
<p><strong>Best regards,</strong><br>Inventory Management System</p>
</body>
</html>
        """
        
        return self.send_email(admin_email, subject, body, html_body)
