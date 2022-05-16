from dotenv import load_dotenv
import os

load_dotenv()

host = os.getenv("host")
user = os.getenv("user")
password = os.getenv("password")

dbconfig = {
  "host": host,
  "user": user,
  "password": password,
  "database": "wehelp3"
}

aws_access_key_id=os.getenv("aws_access_key_id")
aws_secret_access_key=os.getenv("aws_secret_access_key")