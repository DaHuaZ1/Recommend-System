from datetime import datetime, timezone, timedelta

def get_australia_time():
    """获取澳洲东部时间（AEST/AEDT）"""
    australia_tz = timezone(timedelta(hours=10))  # UTC+10
    return datetime.now(australia_tz)

def convert_to_australia_time(time_obj):
    """将时间对象转换为澳洲东部时间字符串"""
    if not time_obj:
        return None
    
    # 如果时间对象没有时区信息，假设它是澳洲时间
    if time_obj.tzinfo is None:
        australia_tz = timezone(timedelta(hours=10))
        time_obj = time_obj.replace(tzinfo=australia_tz)
    
    # 转换为澳洲东部时间
    australia_tz = timezone(timedelta(hours=10))
    local_time = time_obj.astimezone(australia_tz)
    return local_time.isoformat()

def get_australia_timezone():
    """获取澳洲东部时区"""
    return timezone(timedelta(hours=10)) 