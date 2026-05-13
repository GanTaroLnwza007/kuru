from _env import load_project_env
from kuru.db.supabase_client import get_client

load_project_env(__file__)

db = get_client()
db.table("chunks").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
print("Chunks cleared.")
count = db.table("tcas_records").select("id", count="exact").execute()
print(f"TCAS records still intact: {count.count}")
