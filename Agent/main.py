import os
import json
import subprocess
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# ----------------- จัดการ Path & .env -----------------
CURRENT_DIR = Path(__file__).resolve().parent
BASE_DIR = CURRENT_DIR.parent

# รองรับทั้งการวาง .env ใน Agent/ หรือที่ Root
if (CURRENT_DIR / ".env").exists():
    load_dotenv(dotenv_path=CURRENT_DIR / ".env")
else:
    load_dotenv(dotenv_path=BASE_DIR / ".env")

WORKSPACE_DIR = BASE_DIR / "workspace"
WORKSPACE_DIR.mkdir(exist_ok=True)

# ปรับค่า Default ให้ใช้ Gemini ผ่าน OpenAI Compatible API
API_KEY = os.getenv("GOOGLE_API_KEY")
BASE_URL ="https://generativelanguage.googleapis.com/v1beta/openai/"
MODEL_NAME ="gemini-2.0-flash"

if not API_KEY:
    print(f"[X] ไม่พบ GOOGLE_API_KEY ในไฟล์ .env")
    exit(1)

# ----------------- Tools -----------------

def write_file(relative_path: str, content: str) -> str:
    """สร้างหรือเขียนทับไฟล์ใน workspace"""
    target_path = WORKSPACE_DIR / relative_path
    target_path.parent.mkdir(parents=True, exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(content)
    return f"Created/Updated: {relative_path} ({len(content)} chars)"

def read_file(relative_path: str) -> str:
    """อ่านเนื้อหาไฟล์ใน workspace"""
    target_path = WORKSPACE_DIR / relative_path
    if not target_path.exists():
        return f"Error: File {relative_path} not found."
    with open(target_path, "r", encoding="utf-8") as f:
        return f.read()

def run_command(command: str) -> str:
    """รันคำสั่ง Terminal ใน workspace"""
    try:
        res = subprocess.run(
            command, shell=True, cwd=WORKSPACE_DIR, capture_output=True, text=True, timeout=120
        )
        output = res.stdout if res.returncode == 0 else f"ERROR: {res.stderr}\n{res.stdout}"
        return f"Exit code {res.returncode}:\n{output[:500]}" # ตัดส่วนท้ายถ้าผลลัพธ์ยาวเกินไป
    except Exception as e:
        return f"Execution error: {str(e)}"

tools_schema = [
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "สร้างหรือเขียนโค้ดลงในไฟล์ตาม path สัมพัทธ์ใน workspace",
            "parameters": {
                "type": "object",
                "properties": {
                    "relative_path": {"type": "string", "description": "path ของไฟล์ เช่น src/app/page.tsx"},
                    "content": {"type": "string", "description": "โค้ดทั้งหมดในไฟล์"}
                },
                "required": ["relative_path", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "อ่านเนื้อหาไฟล์เดิมใน workspace",
            "parameters": {
                "type": "object",
                "properties": {
                    "relative_path": {"type": "string", "description": "path ของไฟล์ที่ต้องการอ่าน"}
                },
                "required": ["relative_path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_command",
            "description": "รันคำสั่ง shell ในโฟลเดอร์ workspace",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {"type": "string", "description": "คำสั่ง terminal เช่น npm run lint"}
                },
                "required": ["command"]
            }
        }
    }
]

tool_map = {
    "write_file": write_file,
    "read_file": read_file,
    "run_command": run_command
}

# เชื่อมต่อผ่าน OpenAI Client แต่เบื้องหลังวิ่งไปหา Gemini
client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

# ----------------- Visual Workflow Agentic Loop -----------------

def update_agent_status(status: str, task: str):
    """ฟังก์ชันตัวช่วยสำหรับเขียนสถานะลงไฟล์ json ให้เว็บ Next.js ดึงไปโชว์"""
    status_file = WORKSPACE_DIR / "agent_status.json"
    data = {"status": status, "task": task}
    with open(status_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

def run_workflow_agent(task_prompt: str):
    print("\n" + "=" * 60)
    print(f"🎯 [NEW TASK RECEIVED]: {task_prompt}")
    
    # อัปเดตหน้าเว็บว่ากำลังเริ่มคิด
    update_agent_status("working", "กำลังวางแผนโครงสร้าง...")

    messages = [
        {
            "role": "system",
            "content": "คุณคือ AI Lead Full-Stack Engineer คุณสามารถใช้ Tools เพื่ออ่านโค้ดเดิม เขียนไฟล์ใหม่ และรัน Linter ตรวจสอบ Error ได้แบบอิสระ"
        },
        {"role": "user", "content": task_prompt}
    ]

    step_count = 1
    while True:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            tools=tools_schema,
            tool_choice="auto"
        )
        msg = response.choices[0].message
        messages.append(msg)

        if not msg.tool_calls:
            print("✅ [WORKFLOW COMPLETED]")
            # อัปเดตหน้าเว็บเมื่องานเสร็จสมบูรณ์
            update_agent_status("success", "งานเสร็จสมบูรณ์แล้ว! ✅")
            break

        for call in msg.tool_calls:
            fn_name = call.function.name
            fn_args = json.loads(call.function.arguments)
            
            # อัปเดตหน้าเว็บว่ากำลังเรียกใช้ Tool อะไร
            action_desc = f"กำลัง {fn_name}: {fn_args.get('relative_path', fn_args.get('command', ''))}"
            update_agent_status("working", action_desc)
            
            tool_fn = tool_map.get(fn_name)
            result = tool_fn(**fn_args) if tool_fn else "Error"

            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": str(result)
            })

        step_count += 1

if __name__ == "__main__":
    task = """
    อัปเดตไฟล์ `src/components/PixelAgent.tsx` ให้เป็น Widget แสดง Workflow ขั้นเทพ (สไตล์ Glassmorphism ล้ำๆ):
    1. ให้ Component นี้เก็บประวัติคำสั่ง (Logs history) ด้วย `useState<string[]>`
    2. ใน `useEffect` ที่ดึงข้อมูลจาก `/api/status` ทุก 1 วินาที: 
       - ถ้า `data.task` มีค่าเปลี่ยนไปจากเดิม ให้ push ข้อความนั้นลงไปใน logs array (เก็บไว้แสดงสูงสุด 5 บรรทัดล่าสุด)
    3. เลย์เอาต์: จัดให้อยู่มุมขวาล่างเสมอ (fixed, bottom-6, right-6, z-50, flex, items-end, gap-4)
    4. ส่วนซ้าย (Workflow Panel - กล่องแสดงสถานะ): 
       - สร้างกล่องดีไซน์ Glassmorphism (bg-gray-900/80, backdrop-blur-md, border border-white/10, text-white, rounded-2xl, p-4, shadow-2xl, w-80)
       - Header: มีไอคอนสายฟ้า ⚡ หรือข้อความ 'Agent Workflow' พร้อมจุดวงกลมสีเขียวกระพริบ (animate-pulse) แสดงสถานะ Online
       - Body: นำ logs array มา map แสดงผลทีละบรรทัด โดยบรรทัดล่าสุดให้สว่าง (text-white) บรรทัดเก่าๆ ให้สีเทาจาง (text-gray-400 text-sm) เพื่อให้ดูเหมือน Terminal กำลังวิ่ง
    5. ส่วนขวา (Avatar ตุ๊กตา): ขนาด 80x80px 
       - status === 'idle': ใช้รูปกำลังหลับ (https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Sleeping%20Face.png)
       - status === 'working': ใช้รูปทำคอม (https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png) พร้อมใส่ Tailwind `animate-bounce`
       - status === 'success': ใช้รูปปาร์ตี้ (https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Partying%20Face.png)
    """
    run_workflow_agent(task)