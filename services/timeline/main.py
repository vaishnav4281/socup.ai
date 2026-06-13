from fastapi import FastAPI
import strawberry
from strawberry.fastapi import GraphQLRouter
import datetime

app = FastAPI(title="SOCup AI - Timeline", description="Timeline microservice")

@strawberry.type
class Event:
    id: str
    timestamp: str
    event_type: str
    actor: str
    
    def __init__(self, id: str, timestamp: str, event_type: str, actor: str):
        self.id = id
        self.timestamp = timestamp
        self.event_type = event_type
        self.actor = actor

db_timeline = [
    Event(id="101", timestamp="2026-06-13T14:00:00Z", event_type="LOGIN", actor="admin"),
    Event(id="102", timestamp="2026-06-13T14:05:00Z", event_type="FILE_DOWNLOAD", actor="admin"),
]

@strawberry.type
class Query:
    @strawberry.field
    def get_timeline(self) -> list[Event]:
        return db_timeline

@strawberry.type
class Mutation:
    @strawberry.mutation
    def add_timeline_event(self, event_type: str, actor: str) -> Event:
        new_event = Event(
            id=str(100 + len(db_timeline) + 1),
            timestamp=datetime.datetime.utcnow().isoformat() + "Z",
            event_type=event_type,
            actor=actor
        )
        db_timeline.append(new_event)
        return new_event

schema = strawberry.federation.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema)

app.include_router(graphql_app, prefix="/graphql")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
