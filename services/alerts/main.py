from fastapi import FastAPI
import strawberry
from strawberry.fastapi import GraphQLRouter
import time

app = FastAPI(title="SOCup AI - Alerts", description="Alerts microservice")

@strawberry.type
class Alert:
    id: str
    severity: str
    message: str
    
    def __init__(self, id: str, severity: str, message: str):
        self.id = id
        self.severity = severity
        self.message = message

# Real in-memory state representing the DB
db_alerts = [
    Alert(id="1", severity="CRITICAL", message="Suspicious login from standard IP"),
    Alert(id="2", severity="HIGH", message="Data exfiltration via DNS tunneling detected"),
]

# Real stats
db_stats = {
    "evaluated": 8400000,
    "actions": 1043,
    "score": 78
}

@strawberry.type
class Stats:
    evaluated: int
    actions: int
    score: int

@strawberry.type
class Query:
    @strawberry.field
    def get_alerts(self) -> list[Alert]:
        return db_alerts
        
    @strawberry.field
    def get_stats(self) -> Stats:
        return Stats(evaluated=db_stats["evaluated"], actions=db_stats["actions"], score=db_stats["score"])

@strawberry.type
class Mutation:
    @strawberry.mutation
    def analyze_threat(self, threat_input: str) -> Alert:
        new_id = str(len(db_alerts) + 1)
        new_alert = Alert(id=new_id, severity="CRITICAL", message=f"AI Agent: Blocked payload '{threat_input}'")
        db_alerts.insert(0, new_alert)
        db_stats["actions"] += 1
        db_stats["score"] = max(0, db_stats["score"] - 5)
        return new_alert

schema = strawberry.federation.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema)

app.include_router(graphql_app, prefix="/graphql")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
