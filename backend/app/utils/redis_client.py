import redis

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True
)
def get_chat_history(session_id: str):
    return redis_client.lrange(session_id, 0, -1)

def append_to_history(session_id: str, message: str):
    redis_client.rpush(session_id, message)

def clear_history(session_id: str):
    redis_client.delete(session_id)