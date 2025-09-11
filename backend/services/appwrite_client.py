# Appwrite client setup
import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.users import Users
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage

client = Client()
load_dotenv()

(client
    .set_endpoint(os.getenv("APPWRITE_ENDPOINT"))  
    .set_project(os.getenv("APPWRITE_PROJECT_ID"))
    .set_key(os.getenv("APPWRITE_API_KEY"))  
)

users = Users(client)
databases = Databases(client)
storage = Storage(client)  