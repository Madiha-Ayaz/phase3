"""
╔══════════════════════════════════════════════════════════════╗
║               AGENTIC TODO APPLICATION - PHASE I              ║
║         AI-Powered Productivity & Task Management System      ║
╚══════════════════════════════════════════════════════════════╝
"""

import json
import os
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from typing import List, Optional
from enum import Enum

try:
    from colorama import init, Fore, Style, Back
    init(autoreset=True)
except ImportError:
    class Dummy:
        def __getattr__(self, name): return ''
    Fore = Back = Style = Dummy()
    Style.RESET_ALL = ''

DATA_FILE = "tasks.json"
HISTORY_FILE = "todo_history.json"
STATS_FILE = "stats.json"

# ══════════════════════════════════════════════════════════════
# CLASSES & ENUMS
# ══════════════════════════════════════════════════════════════

class Priority(Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"

    def color(self):
        return {
            Priority.URGENT: Fore.RED + Style.BRIGHT + Back.WHITE,
            Priority.HIGH: Fore.RED + Style.BRIGHT,
            Priority.MEDIUM: Fore.YELLOW + Style.BRIGHT,
            Priority.LOW: Fore.CYAN
        }.get(self, "")

    def badge(self):
        return {
            Priority.URGENT: f"{Back.RED}{Fore.WHITE} 🔥 URGENT {Style.RESET_ALL}",
            Priority.HIGH: f"{Back.RED}{Fore.BLACK} ⚠ HIGH {Style.RESET_ALL}",
            Priority.MEDIUM: f"{Back.YELLOW}{Fore.BLACK} ● MED {Style.RESET_ALL}",
            Priority.LOW: f"{Back.CYAN}{Fore.BLACK} ○ LOW {Style.RESET_ALL}"
        }.get(self, "")

    def emoji(self):
        return {
            Priority.URGENT: "🔥",
            Priority.HIGH: "⚠️",
            Priority.MEDIUM: "●",
            Priority.LOW: "○"
        }.get(self, "")

class Category(Enum):
    WORK = "Work"
    PERSONAL = "Personal"
    SHOPPING = "Shopping"
    HEALTH = "Health"
    LEARNING = "Learning"
    OTHER = "Other"

    def emoji(self):
        return {
            Category.WORK: "💼",
            Category.PERSONAL: "🏠",
            Category.SHOPPING: "🛒",
            Category.HEALTH: "🏥",
            Category.LEARNING: "📚",
            Category.OTHER: "📌"
        }.get(self, "📌")

@dataclass
class Task:
    id: int
    title: str
    description: Optional[str] = None
    completed: bool = False
    priority: Priority = Priority.MEDIUM
    category: Category = Category.OTHER
    due_date: Optional[date] = None
    tags: List[str] = field(default_factory=list)
    created_at: date = field(default_factory=date.today)
    completed_at: Optional[date] = None
    notes: List[str] = field(default_factory=list)
    subtasks: List[str] = field(default_factory=list)
    reminder: Optional[date] = None

class ActionType(Enum):
    ADD = "add"
    UPDATE = "update"
    DELETE = "delete"
    TOGGLE = "toggle"
    COMPLETE = "complete"

@dataclass
class HistoryEntry:
    action: ActionType
    task_id: int
    title: str
    timestamp: str
    details: str = ""

@dataclass
class Stats:
    total_completed: int = 0
    total_deleted: int = 0
    streak_days: int = 0
    last_activity: Optional[str] = None
    weekly_goal: int = 10
    monthly_goal: int = 40

tasks: List[Task] = []
history: List[HistoryEntry] = []
stats = Stats()
next_id: int = 1

# ══════════════════════════════════════════════════════════════
# FILE OPERATIONS
# ══════════════════════════════════════════════════════════════

def save_tasks():
    data = [{
        "id": t.id, "title": t.title, "description": t.description,
        "completed": t.completed, "priority": t.priority.value,
        "category": t.category.value,
        "due_date": t.due_date.isoformat() if t.due_date else None,
        "tags": t.tags,
        "created_at": t.created_at.isoformat(),
        "completed_at": t.completed_at.isoformat() if t.completed_at else None,
        "notes": t.notes,
        "subtasks": t.subtasks,
        "reminder": t.reminder.isoformat() if t.reminder else None
    } for t in tasks]
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def load_tasks():
    global tasks, next_id
    if not os.path.exists(DATA_FILE):
        return
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            tasks.clear()
            for item in data:
                tasks.append(Task(
                    id=item["id"],
                    title=item["title"],
                    description=item.get("description"),
                    completed=item["completed"],
                    priority=Priority(item["priority"]),
                    category=Category(item.get("category", "Other")),
                    due_date=date.fromisoformat(item["due_date"]) if item.get("due_date") else None,
                    tags=item.get("tags", []),
                    created_at=date.fromisoformat(item["created_at"]),
                    completed_at=date.fromisoformat(item["completed_at"]) if item.get("completed_at") else None,
                    notes=item.get("notes", []),
                    subtasks=item.get("subtasks", []),
                    reminder=date.fromisoformat(item["reminder"]) if item.get("reminder") else None
                ))
            next_id = max((t.id for t in tasks), default=0) + 1
    except Exception as e:
        print(f"{Fore.RED}Error loading tasks: {e}{Style.RESET_ALL}")

def load_history():
    global history
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                raw = json.load(f)
                history = [HistoryEntry(
                    action=ActionType(entry["action"]),
                    task_id=entry["task_id"],
                    title=entry["title"],
                    timestamp=entry["timestamp"],
                    details=entry.get("details", "")
                ) for entry in raw]
        except:
            history = []

def save_history():
    data = [{"action": h.action.value, "task_id": h.task_id, "title": h.title,
             "timestamp": h.timestamp, "details": h.details} for h in history]
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def load_stats():
    global stats
    if os.path.exists(STATS_FILE):
        try:
            with open(STATS_FILE, "r") as f:
                data = json.load(f)
                stats = Stats(**data)
        except:
            stats = Stats()

def save_stats():
    with open(STATS_FILE, "w") as f:
        json.dump({
            "total_completed": stats.total_completed,
            "total_deleted": stats.total_deleted,
            "streak_days": stats.streak_days,
            "last_activity": stats.last_activity,
            "weekly_goal": stats.weekly_goal,
            "monthly_goal": stats.monthly_goal
        }, f, indent=2)

def add_history(action: ActionType, task: Task, details: str = ""):
    entry = HistoryEntry(action, task.id, task.title,
                        datetime.now().strftime("%Y-%m-%d %H:%M:%S"), details)
    history.append(entry)
    if len(history) > 100:
        history.pop(0)
    save_history()

# ══════════════════════════════════════════════════════════════
# CORE TASK OPERATIONS
# ══════════════════════════════════════════════════════════════

def add_task(title: str, desc: Optional[str] = None,
             priority: Priority = Priority.MEDIUM, 
             category: Category = Category.OTHER,
             due_date: Optional[date] = None,
             tags: List[str] = None) -> Task:
    global next_id
    task = Task(next_id, title.strip(), desc.strip() if desc else None,
                False, priority, category, due_date, tags or [])
    tasks.append(task)
    add_history(ActionType.ADD, task)
    next_id += 1
    save_tasks()
    return task

def get_task(task_id: int) -> Optional[Task]:
    return next((t for t in tasks if t.id == task_id), None)

def update_task(task_id: int, **kwargs) -> bool:
    task = get_task(task_id)
    if not task:
        return False
    changes = []
    for k, v in kwargs.items():
        if v is not None:
            old = getattr(task, k, None)
            if old != v:
                changes.append(f"{k}: {old} → {v}")
            setattr(task, k, v)
    if changes:
        add_history(ActionType.UPDATE, task, "; ".join(changes))
    save_tasks()
    return True

def delete_task(task_id: int) -> bool:
    for i, t in enumerate(tasks):
        if t.id == task_id:
            add_history(ActionType.DELETE, t)
            del tasks[i]
            stats.total_deleted += 1
            save_stats()
            save_tasks()
            return True
    return False

def toggle_complete(task_id: int) -> bool:
    task = get_task(task_id)
    if task:
        task.completed = not task.completed
        if task.completed:
            task.completed_at = date.today()
            stats.total_completed += 1
            stats.last_activity = date.today().isoformat()
            add_history(ActionType.COMPLETE, task, "Task completed")
        else:
            task.completed_at = None
            add_history(ActionType.TOGGLE, task, "Unmarked as complete")
        save_stats()
        save_tasks()
        return True
    return False

def undo_last_action() -> bool:
    if not history:
        return False
    last = history.pop()
    save_history()

    if last.action == ActionType.ADD:
        for i, t in enumerate(tasks):
            if t.id == last.task_id:
                del tasks[i]
                save_tasks()
                return True
    elif last.action in (ActionType.TOGGLE, ActionType.COMPLETE):
        task = get_task(last.task_id)
        if task:
            task.completed = not task.completed
            if not task.completed:
                task.completed_at = None
            save_tasks()
            return True

    print(f"{Fore.YELLOW}⚠ Undo for {last.action.value} not fully implemented yet{Style.RESET_ALL}")
    return False

# ══════════════════════════════════════════════════════════════
# DISPLAY FUNCTIONS
# ══════════════════════════════════════════════════════════════

def print_header():
    print(f"\n{Fore.MAGENTA}{Style.BRIGHT}╔════════════════════════════════════════════════════════════╗")
    print(f"║          ✦ AGENTIC TODO APPLICATION - PHASE I ✦           ║")
    print(f"║       AI-Powered Productivity & Task Management System     ║")
    print(f"╚════════════════════════════════════════════════════════════╝{Style.RESET_ALL}")

def print_fancy_box(text: str, color=Fore.CYAN):
    width = len(text) + 4
    print(f"\n{color}{'═' * width}")
    print(f"  {text}  ")
    print(f"{'═' * width}{Style.RESET_ALL}")

def display_stats_dashboard():
    today = date.today()
    pending = [t for t in tasks if not t.completed]
    completed_today = [t for t in tasks if t.completed and t.completed_at == today]
    overdue = [t for t in tasks if t.due_date and t.due_date < today and not t.completed]
    urgent = [t for t in tasks if t.priority == Priority.URGENT and not t.completed]
    
    week_ago = today - timedelta(days=7)
    completed_week = [t for t in tasks if t.completed and t.completed_at and t.completed_at >= week_ago]

    print(f"\n{Fore.CYAN}{Style.BRIGHT}┌{'─' * 68}┐")
    print(f"│{' ' * 24}📊 DASHBOARD{' ' * 32}│")
    print(f"├{'─' * 68}┤{Style.RESET_ALL}")
    print(f"│  {Fore.WHITE}Total:{Style.RESET_ALL} {Fore.GREEN}{len(tasks)}{Style.RESET_ALL}  "
          f"│  {Fore.YELLOW}Pending:{Style.RESET_ALL} {len(pending)}  "
          f"│  {Fore.GREEN}Done:{Style.RESET_ALL} {stats.total_completed}  "
          f"│  {Fore.MAGENTA}Today:{Style.RESET_ALL} {len(completed_today)}  "
          f"│  {Fore.CYAN}This Week:{Style.RESET_ALL} {len(completed_week)}")
    
    if overdue or urgent:
        print(f"├{'─' * 68}┤")
        alerts = []
        if urgent:
            alerts.append(f"{Fore.RED}🔥 {len(urgent)} URGENT{Style.RESET_ALL}")
        if overdue:
            alerts.append(f"{Fore.RED}⏰ {len(overdue)} Overdue{Style.RESET_ALL}")
        print(f"│  {Fore.WHITE}⚠️ Attention:{Style.RESET_ALL}  " + "  │  ".join(alerts))
    
    print(f"└{'─' * 68}┘{Style.RESET_ALL}\n")

def display_tasks(tasks_to_show: List[Task] = None, title: str = "📋 Tasks"):
    tasks_list = tasks_to_show if tasks_to_show is not None else tasks

    if not tasks_list:
        print(f"\n{Fore.LIGHTBLACK_EX}   ╭───────────────────────────────────╮")
        print(f"   │     ✨ No tasks to display        │")
        print(f"   │     Start by adding a new task!   │")
        print(f"   ╰───────────────────────────────────╯{Style.RESET_ALL}\n")
        return

    today = date.today()
    overdue = sum(1 for t in tasks_list if t.due_date and t.due_date < today and not t.completed)
    completed = sum(1 for t in tasks_list if t.completed)
    progress = int((completed / len(tasks_list)) * 100) if tasks_list else 0

    print(f"\n{Fore.CYAN}{Style.BRIGHT}┌{'─' * 70}┐")
    print(f"│  {title}  •  {today.strftime('%A, %B %d, %Y')}  •  {completed}/{len(tasks_list)} done ({progress}%)")
    if overdue:
        print(f"│  {Fore.RED}⚠ {overdue} overdue tasks need immediate attention!{Style.RESET_ALL}")
    print(f"└{'─' * 70}┘{Style.RESET_ALL}\n")

    for i, t in enumerate(tasks_list, 1):
        status = f"{Fore.GREEN}✔" if t.completed else f"{Fore.WHITE}◯"
        badge = t.priority.badge()
        cat_emoji = t.category.emoji()

        due_str = ""
        if t.due_date:
            days = (t.due_date - today).days
            if days < 0:
                due_str = f" {Fore.RED}⏰ {abs(days)}d overdue{Style.RESET_ALL}"
            elif days == 0:
                due_str = f" {Fore.MAGENTA}📅 DUE TODAY!{Style.RESET_ALL}"
            elif days == 1:
                due_str = f" {Fore.YELLOW}📅 Tomorrow{Style.RESET_ALL}"
            elif days <= 3:
                due_str = f" {Fore.YELLOW}📅 {days}d left{Style.RESET_ALL}"
            else:
                due_str = f"  {Fore.LIGHTBLACK_EX}📅 {t.due_date}{Style.RESET_ALL}"

        title_display = t.title
        if t.completed:
            title_display = f"{Fore.LIGHTBLACK_EX}{Style.DIM}{t.title}{Style.RESET_ALL}"

        print(f"{Fore.LIGHTBLACK_EX}{i:2}.{Style.RESET_ALL} {status} {badge} {cat_emoji} {title_display}{due_str}")
        
        if t.description:
            desc_color = Fore.LIGHTBLACK_EX if t.completed else Fore.WHITE
            print(f"     {desc_color}↳ {t.description}{Style.RESET_ALL}")
        
        if t.tags:
            tags_str = " ".join(f"{Fore.MAGENTA}#{tag}{Style.RESET_ALL}" for tag in t.tags)
            print(f"     {tags_str}")
        
        if t.subtasks:
            completed_sub = sum(1 for s in t.subtasks if s.startswith("✓"))
            print(f"     {Fore.CYAN}└─ Subtasks: {completed_sub}/{len(t.subtasks)}{Style.RESET_ALL}")
    
    print()

def display_task_detail(task: Task):
    today = date.today()
    
    print(f"\n{Fore.CYAN}{Style.BRIGHT}╔{'═' * 68}╗")
    print(f"║  📝 TASK DETAILS #{task.id}{' ' * 48}║")
    print(f"╠{'═' * 68}╣{Style.RESET_ALL}")
    
    status = f"{Fore.GREEN}✅ Completed" if task.completed else f"{Fore.YELLOW}⏳ Pending"
    print(f"║  {Fore.WHITE}Title:{Style.RESET_ALL} {task.title}{' ' * (57 - len(task.title))}║")
    print(f"║  {Fore.WHITE}Status:{Style.RESET_ALL} {status}{Style.RESET_ALL}{' ' * 44}║")
    print(f"║  {Fore.WHITE}Priority:{Style.RESET_ALL} {task.priority.badge()}{' ' * 42}║")
    print(f"║  {Fore.WHITE}Category:{Style.RESET_ALL} {task.category.emoji()} {task.category.value}{' ' * (50 - len(task.category.value))}║")
    
    if task.description:
        desc_short = task.description[:52] + "..." if len(task.description) > 52 else task.description
        print(f"║  {Fore.WHITE}Description:{Style.RESET_ALL} {desc_short}{' ' * (41 - len(desc_short))}║")
    
    if task.due_date:
        days_left = (task.due_date - today).days
        due_text = f"{task.due_date} ({days_left}d left)" if days_left >= 0 else f"{task.due_date} ({abs(days_left)}d overdue)"
        print(f"║  {Fore.WHITE}Due Date:{Style.RESET_ALL} {due_text}{' ' * (52 - len(due_text))}║")
    
    if task.tags:
        tags_str = ", ".join(task.tags)
        if len(tags_str) > 54:
            tags_str = tags_str[:51] + "..."
        print(f"║  {Fore.WHITE}Tags:{Style.RESET_ALL} {tags_str}{' ' * (58 - len(tags_str))}║")
    
    print(f"║  {Fore.WHITE}Created:{Style.RESET_ALL} {task.created_at}{' ' * 51}║")
    
    if task.completed_at:
        print(f"║  {Fore.WHITE}Completed:{Style.RESET_ALL} {task.completed_at}{' ' * 49}║")
    
    print(f"╚{'═' * 68}╝{Style.RESET_ALL}\n")

def show_history():
    if not history:
        print(f"\n{Fore.YELLOW}No activity history found.{Style.RESET_ALL}")
        return
    
    print(f"\n{Fore.CYAN}{Style.BRIGHT}╔{'═' * 68}╗")
    print(f"║  📜 RECENT ACTIVITY HISTORY (Last {min(len(history), 10)} actions){' ' * 20}║")
    print(f"╠{'═' * 68}╣{Style.RESET_ALL}")
    
    for entry in reversed(history[-10:]):
        action_icon = {
            ActionType.ADD: "➕",
            ActionType.UPDATE: "✏️",
            ActionType.DELETE: "🗑️",
            ActionType.TOGGLE: "↔️",
            ActionType.COMPLETE: "✅"
        }.get(entry.action, "•")
        
        action_color = {
            ActionType.ADD: Fore.GREEN,
            ActionType.UPDATE: Fore.YELLOW,
            ActionType.DELETE: Fore.RED,
            ActionType.COMPLETE: Fore.GREEN
        }.get(entry.action, Fore.WHITE)
        
        title_short = entry.title[:30] + "..." if len(entry.title) > 30 else entry.title
        print(f"  {action_icon} {action_color}{entry.action.value.upper()}{Style.RESET_ALL}: {title_short}")
        print(f"     {Fore.LIGHTBLACK_EX}{entry.timestamp}{Style.RESET_ALL}")
        if entry.details:
            details_short = entry.details[:60] + "..." if len(entry.details) > 60 else entry.details
            print(f"     {Fore.LIGHTBLACK_EX}└─ {details_short}{Style.RESET_ALL}")
    
    print(f"{Fore.CYAN}╚{'═' * 68}╝{Style.RESET_ALL}\n")

# ══════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ══════════════════════════════════════════════════════════════

def press_enter_to_continue():
    print(f"\n{Fore.LIGHTBLACK_EX}━━━ Press Enter to continue ━━━{Style.RESET_ALL}")
    input()

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def show_motivational_message():
    messages = [
        "🌟 Excellent work! Keep the momentum going!",
        "💪 You're on fire today!",
        "✨ Stay focused and achieve greatness!",
        "🚀 Every task completed is progress!",
        "🎯 One step closer to your goals!",
        "⭐ Amazing! You're crushing it!",
        "🏆 Productivity champion!",
        "💎 Outstanding effort!"
    ]
    import random
    print(f"\n{Fore.GREEN}{random.choice(messages)}{Style.RESET_ALL}")

# ══════════════════════════════════════════════════════════════
# MAIN MENU
# ══════════════════════════════════════════════════════════════

def main():
    clear_screen()
    print_header()
    
    load_tasks()
    load_history()
    load_stats()
    
    display_stats_dashboard()
    display_tasks()

    while True:
        print(f"\n{Fore.CYAN}{'═' * 70}{Style.RESET_ALL}")
        print(f"{Fore.WHITE}{Style.BRIGHT}📱 MAIN MENU:{Style.RESET_ALL}")
        print(f"  {Fore.CYAN}1.{Style.RESET_ALL} 📋 Show all tasks          {Fore.CYAN}8.{Style.RESET_ALL} 📊 Sort tasks")
        print(f"  {Fore.CYAN}2.{Style.RESET_ALL} ⏳ Pending tasks only      {Fore.CYAN}9.{Style.RESET_ALL} ↶  Undo last action")
        print(f"  {Fore.CYAN}3.{Style.RESET_ALL} ➕ Add new task            {Fore.CYAN}10.{Style.RESET_ALL} 🗑️  Clear completed")
        print(f"  {Fore.CYAN}4.{Style.RESET_ALL} ✏️  Edit task               {Fore.CYAN}11.{Style.RESET_ALL} 📈 View statistics")
        print(f"  {Fore.CYAN}5.{Style.RESET_ALL} 🗑️  Delete task             {Fore.CYAN}12.{Style.RESET_ALL} 📝 View task detail")
        print(f"  {Fore.CYAN}6.{Style.RESET_ALL} ✅ Toggle complete         {Fore.CYAN}13.{Style.RESET_ALL} 📜 Activity history")
        print(f"  {Fore.CYAN}7.{Style.RESET_ALL} 🔍 Search tasks            {Fore.CYAN}14.{Style.RESET_ALL} 🏷️  Filter by category")
        print(f"  {Fore.RED}0.{Style.RESET_ALL} 🚪 Exit")
        print(f"{Fore.CYAN}{'═' * 70}{Style.RESET_ALL}")

        choice = input(f"\n{Fore.LIGHTCYAN_EX}➜ Your choice: {Style.RESET_ALL}").strip()

        print()

        if choice == "1":
            clear_screen()
            print_header()
            display_stats_dashboard()
            display_tasks()
            press_enter_to_continue()

        elif choice == "2":
            clear_screen()
            print_header()
            pending = [t for t in tasks if not t.completed]
            display_tasks(pending, "⏳ Pending Tasks")
            press_enter_to_continue()

        elif choice == "3":
            print_fancy_box("➕ ADD NEW TASK", Fore.GREEN)
            title = input(f"  {Fore.WHITE}Title:{Style.RESET_ALL} ").strip()
            if not title:
                print(f"{Fore.RED}❌ Title is required!{Style.RESET_ALL}")
                press_enter_to_continue()
                continue
            
            desc = input(f"  {Fore.WHITE}Description (optional):{Style.RESET_ALL} ").strip() or None

            print(f"  {Fore.WHITE}Priority:{Style.RESET_ALL} [u]rgent / [h]igh / [m]edium / [l]ow  (default: m)")
            p = input(f"  {Fore.LIGHTCYAN_EX}➜{Style.RESET_ALL} ").strip().lower()
            priority_map = {"u": Priority.URGENT, "h": Priority.HIGH, "l": Priority.LOW}
            priority = priority_map.get(p[0] if p else "", Priority.MEDIUM)

            print(f"  {Fore.WHITE}Category:{Style.RESET_ALL} [w]ork / [p]ersonal / [s]hopping / [h]ealth / [l]earning / [o]ther  (default: o)")
            c = input(f"  {Fore.LIGHTCYAN_EX}➜{Style.RESET_ALL} ").strip().lower()
            category_map = {"w": Category.WORK, "p": Category.PERSONAL, "s": Category.SHOPPING, 
                          "h": Category.HEALTH, "l": Category.LEARNING}
            category = category_map.get(c[0] if c else "", Category.OTHER)

            due_input = input(f"  {Fore.WHITE}Due date (YYYY-MM-DD) or empty:{Style.RESET_ALL} ").strip()
            due = None
            if due_input:
                try:
                    due = datetime.strptime(due_input, "%Y-%m-%d").date()
                except ValueError:
                    print(f"{Fore.RED}❌ Invalid date format{Style.RESET_ALL}")
                    press_enter_to_continue()
                    continue

            tags_input = input(f"  {Fore.WHITE}Tags (comma separated, optional):{Style.RESET_ALL} ").strip()
            tags = [t.strip().lower() for t in tags_input.split(",") if t.strip()] if tags_input else []

            task = add_task(title, desc, priority, category, due, tags)
            print(f"\n{Fore.GREEN}✅ Task #{task.id} added successfully!{Style.RESET_ALL}")
            show_motivational_message()
            press_enter_to_continue()

        elif choice in ("4", "5", "6", "12"):
            display_tasks()
            try:
                task_num = int(input(f"  {Fore.LIGHTCYAN_EX}➜ Task number:{Style.RESET_ALL} "))
                if task_num < 1 or task_num > len(tasks):
                    raise ValueError
                task = tasks[task_num - 1]
            except:
                print(f"{Fore.RED}❌ Invalid selection{Style.RESET_ALL}")
                press_enter_to_continue()
                continue

            if choice == "12":
                display_task_detail(task)
                press_enter_to_continue()

            elif choice == "4":
                print_fancy_box(f"✏️ EDITING: {task.title}", Fore.YELLOW)
                new_title = input(f"  {Fore.WHITE}New title (Enter = keep):{Style.RESET_ALL} ").strip() or None
                new_desc = input(f"  {Fore.WHITE}New description (Enter = keep, 'none' = remove):{Style.RESET_ALL} ").strip()
                new_desc = None if new_desc.lower() == 'none' else (new_desc or task.description)

                p = input(f"  {Fore.WHITE}Priority u/h/m/l (Enter = keep):{Style.RESET_ALL} ").strip().lower()
                priority_map = {"u": Priority.URGENT, "h": Priority.HIGH, "m": Priority.MEDIUM, "l": Priority.LOW}
                new_pri = priority_map.get(p[0] if p else None)

                c = input(f"  {Fore.WHITE}Category w/p/s/h/l/o (Enter = keep):{Style.RESET_ALL} ").strip().lower()
                category_map = {"w": Category.WORK, "p": Category.PERSONAL, "s": Category.SHOPPING,
                              "h": Category.HEALTH, "l": Category.LEARNING, "o": Category.OTHER}
                new_cat = category_map.get(c[0] if c else None)

                due = input(f"  {Fore.WHITE}New due (current: {task.due_date or 'none'}):{Style.RESET_ALL} ").strip()
                new_due = task.due_date
                if due:
                    try:
                        new_due = datetime.strptime(due, "%Y-%m-%d").date()
                    except:
                        print(f"{Fore.RED}❌ Wrong format, keeping old{Style.RESET_ALL}")

                tags_input = input(f"  {Fore.WHITE}New tags (current: {', '.join(task.tags) or 'none'}):{Style.RESET_ALL} ").strip()
                new_tags = [t.strip().lower() for t in tags_input.split(",") if t.strip()] if tags_input else task.tags

                update_task(task.id, title=new_title, description=new_desc,
                           priority=new_pri, category=new_cat, due_date=new_due, tags=new_tags)
                print(f"\n{Fore.GREEN}✅ Task updated successfully!{Style.RESET_ALL}")

            elif choice == "5":
                if input(f"  {Fore.RED}Delete '{task.title}'? (y/N):{Style.RESET_ALL} ").strip().lower().startswith('y'):
                    delete_task(task.id)
                    print(f"\n{Fore.GREEN}✅ Task deleted{Style.RESET_ALL}")
                else:
                    print(f"\n{Fore.YELLOW}⚠ Delete cancelled{Style.RESET_ALL}")

            elif choice == "6":
                toggle_complete(task.id)
                updated_task = get_task(task.id)
                if updated_task and updated_task.completed:
                    print(f"\n{Fore.GREEN}🎉 Task marked as completed!{Style.RESET_ALL}")
                    show_motivational_message()
                else:
                    print(f"\n{Fore.YELLOW}⏳ Task marked as pending{Style.RESET_ALL}")

            press_enter_to_continue()

        elif choice == "7":
            print_fancy_box("🔍 SEARCH TASKS", Fore.CYAN)
            term = input(f"  {Fore.WHITE}Enter search term (title/desc/tags):{Style.RESET_ALL} ").strip().lower()
            if term:
                filtered = [
                    t for t in tasks
                    if term in t.title.lower() or
                       (t.description and term in t.description.lower()) or
                       any(term in tag for tag in t.tags)
                ]
                if filtered:
                    display_tasks(filtered, f"🔍 Search Results: '{term}'")
                else:
                    print(f"\n{Fore.YELLOW}⚠ No tasks found matching '{term}'{Style.RESET_ALL}")
            else:
                print(f"\n{Fore.YELLOW}⚠ No search term entered{Style.RESET_ALL}")
            press_enter_to_continue()

        elif choice == "8":
            print(f"\n{Fore.WHITE}📊 Sort by:{Style.RESET_ALL}")
            print(f"  {Fore.CYAN}a.{Style.RESET_ALL} Priority (urgent → low)")
            print(f"  {Fore.CYAN}b.{Style.RESET_ALL} Due date (soonest first)")
            print(f"  {Fore.CYAN}c.{Style.RESET_ALL} Created date (newest first)")
            print(f"  {Fore.CYAN}d.{Style.RESET_ALL} Title (A-Z)")
            print(f"  {Fore.CYAN}e.{Style.RESET_ALL} Category")
            s = input(f"  {Fore.LIGHTCYAN_EX}➜{Style.RESET_ALL} ").strip().lower()

            if s == 'a':
                sorted_list = sorted(tasks, key=lambda t: (-list(Priority).index(t.priority), t.id))
            elif s == 'b':
                sorted_list = sorted(tasks, key=lambda t: (t.due_date or date(9999,12,31), t.id))
            elif s == 'c':
                sorted_list = sorted(tasks, key=lambda t: t.created_at, reverse=True)
            elif s == 'd':
                sorted_list = sorted(tasks, key=lambda t: t.title.lower())
            elif s == 'e':
                sorted_list = sorted(tasks, key=lambda t: t.category.value)
            else:
                sorted_list = tasks
                print(f"{Fore.YELLOW}⚠ Using default order{Style.RESET_ALL}")

            display_tasks(sorted_list, "📊 Sorted Tasks")
            press_enter_to_continue()

        elif choice == "9":
            if undo_last_action():
                print(f"\n{Fore.GREEN}✅ Last action undone successfully!{Style.RESET_ALL}")
            else:
                print(f"\n{Fore.YELLOW}⚠ Nothing to undo{Style.RESET_ALL}")
            press_enter_to_continue()

        elif choice == "10":
            completed_count = sum(1 for t in tasks if t.completed)
            if completed_count == 0:
                print(f"{Fore.YELLOW}⚠ No completed tasks to clear{Style.RESET_ALL}")
            else:
                if input(f"  {Fore.RED}Clear {completed_count} completed tasks? (y/N):{Style.RESET_ALL} ").strip().lower().startswith('y'):
                    old_len = len(tasks)
                    tasks[:] = [t for t in tasks if not t.completed]
                    save_tasks()
                    print(f"\n{Fore.GREEN}✅ Cleared {old_len - len(tasks)} tasks{Style.RESET_ALL}")
                else:
                    print(f"\n{Fore.YELLOW}⚠ Clear cancelled{Style.RESET_ALL}")
            press_enter_to_continue()

        elif choice == "11":
            clear_screen()
            print_header()
            print_fancy_box("📈 PRODUCTIVITY STATISTICS", Fore.MAGENTA)
            
            today = date.today()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            completed_week = [t for t in tasks if t.completed and t.completed_at and t.completed_at >= week_ago]
            completed_month = [t for t in tasks if t.completed and t.completed_at and t.completed_at >= month_ago]
            pending = [t for t in tasks if not t.completed]
            overdue = [t for t in pending if t.due_date and t.due_date < today]
            
            print(f"\n{Fore.CYAN}{'═' * 60}{Style.RESET_ALL}")
            print(f"  {Fore.WHITE}📊 Overall Statistics:{Style.RESET_ALL}")
            print(f"    • All-time completed: {Fore.GREEN}{stats.total_completed}{Style.RESET_ALL}")
            print(f"    • All-time deleted: {Fore.RED}{stats.total_deleted}{Style.RESET_ALL}")
            print(f"    • Current active tasks: {Fore.YELLOW}{len(tasks)}{Style.RESET_ALL}")
            print(f"\n  {Fore.WHITE}📅 Recent Activity:{Style.RESET_ALL}")
            print(f"    • Completed this week: {Fore.GREEN}{len(completed_week)}{Style.RESET_ALL} / {stats.weekly_goal} (goal)")
            print(f"    • Completed this month: {Fore.GREEN}{len(completed_month)}{Style.RESET_ALL} / {stats.monthly_goal} (goal)")
            
            week_progress = int((len(completed_week) / stats.weekly_goal) * 100) if stats.weekly_goal else 0
            month_progress = int((len(completed_month) / stats.monthly_goal) * 100) if stats.monthly_goal else 0
            
            print(f"\n  {Fore.WHITE}🎯 Goal Progress:{Style.RESET_ALL}")
            print(f"    • Weekly: {week_progress}%  {'█' * (week_progress // 10)}")
            print(f"    • Monthly: {month_progress}%  {'█' * (month_progress // 10)}")
            
            print(f"\n  {Fore.WHITE}⚠️ Attention Needed:{Style.RESET_ALL}")
            print(f"    • Pending tasks: {Fore.YELLOW}{len(pending)}{Style.RESET_ALL}")
            print(f"    • Overdue tasks: {Fore.RED}{len(overdue)}{Style.RESET_ALL}")
            
            if tasks:
                priority_counts = {}
                for p in Priority:
                    count = sum(1 for t in tasks if t.priority == p and not t.completed)
                    if count > 0:
                        priority_counts[p] = count
                
                if priority_counts:
                    print(f"\n  {Fore.WHITE}🎯 By Priority (Pending):{Style.RESET_ALL}")
                    for p, count in sorted(priority_counts.items(), key=lambda x: -list(Priority).index(x[0])):
                        print(f"    • {p.emoji()} {p.value}: {count}")
                
                category_counts = {}
                for c in Category:
                    count = sum(1 for t in tasks if t.category == c and not t.completed)
                    if count > 0:
                        category_counts[c] = count
                
                if category_counts:
                    print(f"\n  {Fore.WHITE}🏷️ By Category (Pending):{Style.RESET_ALL}")
                    for c, count in sorted(category_counts.items(), key=lambda x: -x[1]):
                        print(f"    • {c.emoji()} {c.value}: {count}")
            
            print(f"{Fore.CYAN}{'═' * 60}{Style.RESET_ALL}")
            
            if stats.total_completed >= 50:
                print(f"\n{Fore.GREEN}🏆 Achievement Unlocked: Master Achiever! (50+ tasks){Style.RESET_ALL}")
            elif stats.total_completed >= 25:
                print(f"\n{Fore.CYAN}🌟 Achievement Unlocked: Super Productive! (25+ tasks){Style.RESET_ALL}")
            elif stats.total_completed >= 10:
                print(f"\n{Fore.YELLOW}⭐ Achievement Unlocked: Getting Started! (10+ tasks){Style.RESET_ALL}")
            
            press_enter_to_continue()

        elif choice == "13":
            clear_screen()
            print_header()
            show_history()
            press_enter_to_continue()

        elif choice == "14":
            print(f"\n{Fore.WHITE}🏷️ Filter by category:{Style.RESET_ALL}")
            for i, cat in enumerate(Category, 1):
                count = sum(1 for t in tasks if t.category == cat)
                print(f"  {Fore.CYAN}{i}.{Style.RESET_ALL} {cat.emoji()} {cat.value} ({count} tasks)")
            
            try:
                cat_choice = int(input(f"\n  {Fore.LIGHTCYAN_EX}➜ Select category:{Style.RESET_ALL} "))
                if 1 <= cat_choice <= len(Category):
                    selected_cat = list(Category)[cat_choice - 1]
                    filtered = [t for t in tasks if t.category == selected_cat]
                    display_tasks(filtered, f"🏷️ Category: {selected_cat.emoji()} {selected_cat.value}")
                else:
                    print(f"{Fore.RED}❌ Invalid selection{Style.RESET_ALL}")
            except:
                print(f"{Fore.RED}❌ Invalid input{Style.RESET_ALL}")
            
            press_enter_to_continue()

        elif choice == "0":
            print(f"\n{Fore.MAGENTA}{Style.BRIGHT}╔════════════════════════════════════════════════════════╗")
            print(f"║     ✦ Thank you for using Agentic TODO App! ✦         ║")
            print(f"║          Stay productive and achieve your goals! 🚀    ║")
            print(f"╚════════════════════════════════════════════════════════╝{Style.RESET_ALL}\n")
            break

        else:
            print(f"{Fore.RED}❌ Please select a valid option (0-14){Style.RESET_ALL}")
            press_enter_to_continue()

if __name__ == "__main__":
    main()