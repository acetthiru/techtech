import { Question } from "../types";

/**
 * TECH BRIDGE '26: AUTHORITATIVE 30-QUESTIONS-PER-ROUND MASTER DATASET
 * Contains exactly 30 comprehensive visual technical rebus questions for EACH round (90 questions total).
 * Every single question features:
 * - Exactly 2 highly relevant, connected realistic real-world photos (Image 1 + Image 2 = Technical Answer)
 * - Distinct vector clue panels with descriptions removed
 * - Strict proctor explanations, aliases, and exact points
 */

export const ROUND_1_THIRTY_QUESTIONS: Question[] = [
  {
    "id": "r1-q30-01",
    "title": "Dynamic Memory Depletion",
    "round": 1,
    "set": "A",
    "questionNumber": 1,
    "domain": "Operating Systems",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Memory Leak",
    "aliases": [
      "memory leak",
      "memory leakage",
      "mem leak"
    ],
    "images": [
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "cpu"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "leak"
      }
    ],
    "explanation": "RAM Memory Chip + Leaking Water Drop = Memory Leak.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-02",
    "title": "Call Stack Limit Depletion",
    "round": 1,
    "set": "A",
    "questionNumber": 2,
    "domain": "Data Structures",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Stack Overflow",
    "aliases": [
      "stack overflow",
      "stackoverflow"
    ],
    "images": [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "plates"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "overflow"
      }
    ],
    "explanation": "Vertical stack of plates + Glass overflowing = Stack Overflow.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-03",
    "title": "Process Lock Contention",
    "round": 1,
    "set": "A",
    "questionNumber": 3,
    "domain": "Operating Systems",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Deadlock",
    "aliases": [
      "deadlock",
      "dead lock"
    ],
    "images": [
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "road_deadlock"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "key_lock"
      }
    ],
    "explanation": "Traffic gridlock + Steel padlock = Deadlock.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-04",
    "title": "Virtual Memory Address Fault",
    "round": 1,
    "set": "A",
    "questionNumber": 4,
    "domain": "Operating Systems",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Page Fault",
    "aliases": [
      "page fault",
      "pagefault"
    ],
    "images": [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "book_library"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "wire_circuit"
      }
    ],
    "explanation": "Book Page + Seismic Fault crack = Page Fault.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-05",
    "title": "CPU Pipelining Sequence",
    "round": 1,
    "set": "A",
    "questionNumber": 5,
    "domain": "Computer Architecture",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Instruction Pipeline",
    "aliases": [
      "instruction pipeline",
      "pipeline"
    ],
    "images": [
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "gear_spin"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "pipe"
      }
    ],
    "explanation": "Clockwork Gears + Industrial Pipeline = Instruction Pipeline.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-06",
    "title": "High-Speed Cache Access Match",
    "round": 1,
    "set": "A",
    "questionNumber": 6,
    "domain": "Computer Architecture",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Cache Hit",
    "aliases": [
      "cache hit",
      "cachehit"
    ],
    "images": [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "cache"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "lightning"
      }
    ],
    "explanation": "Storage Cache + Lightning strike Hit = Cache Hit.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-07",
    "title": "Relational Referential Key",
    "round": 1,
    "set": "A",
    "questionNumber": 7,
    "domain": "Databases",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Foreign Key",
    "aliases": [
      "foreign key",
      "foreignkey"
    ],
    "images": [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "network_mesh"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "key_lock"
      }
    ],
    "explanation": "Foreign globe + Antique Key = Foreign Key.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-08",
    "title": "Concurrent Execution Timing Bug",
    "round": 1,
    "set": "A",
    "questionNumber": 8,
    "domain": "Concurrency",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Race Condition",
    "aliases": [
      "race condition",
      "racecondition"
    ],
    "images": [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "clock"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "balance"
      }
    ],
    "explanation": "Track Sprint Race + Road Condition = Race Condition.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-09",
    "title": "Automatic Unused Memory Reclaimer",
    "round": 1,
    "set": "A",
    "questionNumber": 9,
    "domain": "Programming Languages",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Garbage Collection",
    "aliases": [
      "garbage collection",
      "gc"
    ],
    "images": [
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "water_bucket"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "book_library"
      }
    ],
    "explanation": "Trash Garbage bin + Archive Collection = Garbage Collection.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-10",
    "title": "Hardware Kernel Interface Driver",
    "round": 1,
    "set": "A",
    "questionNumber": 10,
    "domain": "Operating Systems",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Device Driver",
    "aliases": [
      "device driver",
      "driver"
    ],
    "images": [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "cpu"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "terminal"
      }
    ],
    "explanation": "Electronic Hardware Device + Automobile Driver = Device Driver.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-11",
    "title": "Bitwise Register Movement",
    "round": 1,
    "set": "A",
    "questionNumber": 11,
    "domain": "Computer Architecture",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Bit Shift",
    "aliases": [
      "bit shift",
      "bitwise shift"
    ],
    "images": [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "wire_circuit"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "arrows_sync"
      }
    ],
    "explanation": "Steel Drill Bit + Vehicle Gear Shift = Bit Shift.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-12",
    "title": "Pre-allocated Thread Pool",
    "round": 1,
    "set": "A",
    "questionNumber": 12,
    "domain": "Concurrency",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Thread Pool",
    "aliases": [
      "thread pool",
      "threadpool"
    ],
    "images": [
      "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "wire_circuit"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "water_bucket"
      }
    ],
    "explanation": "Spool of Thread + Clear Swimming Pool = Thread Pool.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-13",
    "title": "Powerless Hardware Start",
    "round": 1,
    "set": "A",
    "questionNumber": 13,
    "domain": "Operating Systems",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Cold Boot",
    "aliases": [
      "cold boot",
      "cold reboot"
    ],
    "images": [
      "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "lightning"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "terminal"
      }
    ],
    "explanation": "Freezing Cold snow + Leather Boot = Cold Boot.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-14",
    "title": "Isolated Execution Container",
    "round": 1,
    "set": "A",
    "questionNumber": 14,
    "domain": "Cybersecurity",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Sandbox",
    "aliases": [
      "sandbox",
      "sand box"
    ],
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "cube_grid"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "shield_check"
      }
    ],
    "explanation": "Beach Sand + Delivery Box = Sandbox.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-15",
    "title": "Stealth Kernel Modification Kit",
    "round": 1,
    "set": "A",
    "questionNumber": 15,
    "domain": "Cybersecurity",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Rootkit",
    "aliases": [
      "rootkit",
      "root kit"
    ],
    "images": [
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "tree"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "wrench_tool"
      }
    ],
    "explanation": "Tree Root + Tool Kit = Rootkit.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-16",
    "title": "Keystroke Recording Spyware",
    "round": 1,
    "set": "A",
    "questionNumber": 16,
    "domain": "Cybersecurity",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Keylogger",
    "aliases": [
      "keylogger",
      "key logger"
    ],
    "images": [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516216628859-9bcceabb84ca?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "key_lock"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "tree"
      }
    ],
    "explanation": "Keyboard Key + Timber Log = Keylogger.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-17",
    "title": "Network Perimeter Defense",
    "round": 1,
    "set": "A",
    "questionNumber": 17,
    "domain": "Networking",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Firewall",
    "aliases": [
      "firewall",
      "fire wall"
    ],
    "images": [
      "https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "lightning"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "shield_check"
      }
    ],
    "explanation": "Fire + Brick Wall = Firewall.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-18",
    "title": "Decoy Trap for Cyber Attackers",
    "round": 1,
    "set": "A",
    "questionNumber": 18,
    "domain": "Cybersecurity",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Honeypot",
    "aliases": [
      "honeypot",
      "honey pot"
    ],
    "images": [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "water_bucket"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "table"
      }
    ],
    "explanation": "Jar of Honey + Ceramic Pot = Honeypot.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-19",
    "title": "Large-Scale Pattern Mining",
    "round": 1,
    "set": "A",
    "questionNumber": 19,
    "domain": "Data Science",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Data Mining",
    "aliases": [
      "data mining",
      "datamining"
    ],
    "images": [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "matrix"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "wrench_tool"
      }
    ],
    "explanation": "Numeric Data + Pickaxe Mining = Data Mining.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-20",
    "title": "Deceptive Malware Disguise",
    "round": 1,
    "set": "A",
    "questionNumber": 20,
    "domain": "Cybersecurity",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Trojan Horse",
    "aliases": [
      "trojan horse",
      "trojan"
    ],
    "images": [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "shield_check"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cube_grid"
      }
    ],
    "explanation": "Trojan Wood + Living Horse = Trojan Horse.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-21",
    "title": "Encrypted Underground Web",
    "round": 1,
    "set": "A",
    "questionNumber": 21,
    "domain": "Networking",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Dark Web",
    "aliases": [
      "dark web",
      "darknet"
    ],
    "images": [
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "key_lock"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "network_mesh"
      }
    ],
    "explanation": "Dark Shadow + Spider Web = Dark Web.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-22",
    "title": "Microservice Framework Launcher",
    "round": 1,
    "set": "A",
    "questionNumber": 22,
    "domain": "Software Engineering",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Spring Boot",
    "aliases": [
      "spring boot",
      "springboot"
    ],
    "images": [
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "tree"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "terminal"
      }
    ],
    "explanation": "Spring flora + Heavy Boot = Spring Boot.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-23",
    "title": "Fraudulent Credential Harvesting",
    "round": 1,
    "set": "A",
    "questionNumber": 23,
    "domain": "Cybersecurity",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Phishing",
    "aliases": [
      "phishing",
      "phish"
    ],
    "images": [
      "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "network_mesh"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "search_glass"
      }
    ],
    "explanation": "Fishing tackle + Hook bait = Phishing.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-24",
    "title": "Unsolicited Bulk Email",
    "round": 1,
    "set": "A",
    "questionNumber": 24,
    "domain": "Networking",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Spam Mail",
    "aliases": [
      "spam mail",
      "spam email",
      "spam"
    ],
    "images": [
      "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "table"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "book_library"
      }
    ],
    "explanation": "Canned Spam + Envelope Mail = Spam Mail.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-25",
    "title": "Malicious Hacker Persona",
    "round": 1,
    "set": "A",
    "questionNumber": 25,
    "domain": "Cybersecurity",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Black Hat",
    "aliases": [
      "black hat",
      "blackhat"
    ],
    "images": [
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "key_lock"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "shield_check"
      }
    ],
    "explanation": "Black color + Fedora Hat = Black Hat.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-26",
    "title": "Hosted Remote Server Storage",
    "round": 1,
    "set": "A",
    "questionNumber": 26,
    "domain": "Distributed Systems",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Cloud Storage",
    "aliases": [
      "cloud storage",
      "cloud"
    ],
    "images": [
      "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "network_mesh"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "server_farm"
      }
    ],
    "explanation": "Sky Cloud + Warehouse Storage = Cloud Storage.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-27",
    "title": "Duplicate Hash Bucket Collision",
    "round": 1,
    "set": "A",
    "questionNumber": 27,
    "domain": "Algorithms",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Hash Collision",
    "aliases": [
      "hash collision",
      "hash clash"
    ],
    "images": [
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "key_lock"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "lightning"
      }
    ],
    "explanation": "Cryptographic Key + Vehicle Collision = Hash Collision.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-28",
    "title": "Domain Name IP Address Query",
    "round": 1,
    "set": "A",
    "questionNumber": 28,
    "domain": "Networking",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "DNS Lookup",
    "aliases": [
      "dns lookup",
      "dns"
    ],
    "images": [
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "book_library"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "search_glass"
      }
    ],
    "explanation": "Directory Registry + Magnifying Glass = DNS Lookup.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-29",
    "title": "Database Transaction Guarantee",
    "round": 1,
    "set": "A",
    "questionNumber": 29,
    "domain": "Databases",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "ACID Properties",
    "aliases": [
      "acid properties",
      "acid"
    ],
    "images": [
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "leak"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "balance"
      }
    ],
    "explanation": "Laboratory Acid + Balance Scale = ACID Properties.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r1-q30-30",
    "title": "TCP Handshake Agreement",
    "round": 1,
    "set": "A",
    "questionNumber": 30,
    "domain": "Networking",
    "difficulty": "Medium",
    "points": 1,
    "correctAnswer": "Three Way Handshake",
    "aliases": [
      "three way handshake",
      "tcp handshake",
      "3 way handshake"
    ],
    "images": [
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "token"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "arrows_sync"
      }
    ],
    "explanation": "Sync Signal + Business Handshake = Three Way Handshake.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  }
];

export const ROUND_2_THIRTY_QUESTIONS: Question[] = [
  {
    "id": "r2-q30-01",
    "title": "Helm of Container Cluster",
    "round": 2,
    "set": "A",
    "questionNumber": 1,
    "domain": "Container Orchestration",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Kubernetes",
    "aliases": [
      "kubernetes",
      "k8s"
    ],
    "images": [
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "gear_spin"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "token"
      }
    ],
    "explanation": "Steering Ship Wheel + Cargo Containers = Kubernetes.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-02",
    "title": "Undisclosed Vulnerability Attack",
    "round": 2,
    "set": "A",
    "questionNumber": 2,
    "domain": "Cybersecurity",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Zero Day Exploit",
    "aliases": [
      "zero day exploit",
      "zero day",
      "0-day"
    ],
    "images": [
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "clock"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "lightning"
      }
    ],
    "explanation": "Zero Hour Clock + Lightning Exploit = Zero Day Exploit.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-03",
    "title": "Distributed Consistency-Availability Tradeoff",
    "round": 2,
    "set": "A",
    "questionNumber": 3,
    "domain": "Distributed Systems",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "CAP Theorem",
    "aliases": [
      "cap theorem",
      "cap"
    ],
    "images": [
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "umbrella"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "balance"
      }
    ],
    "explanation": "Head Cap + Balance Scale Theorem = CAP Theorem.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-04",
    "title": "Traffic Distribution Proxy",
    "round": 2,
    "set": "A",
    "questionNumber": 4,
    "domain": "Cloud Architecture",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Load Balancer",
    "aliases": [
      "load balancer",
      "load balancing"
    ],
    "images": [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "balance"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "shield_check"
      }
    ],
    "explanation": "Cargo Heavy Load + Equalizing Balance = Load Balancer.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-05",
    "title": "Distributed Partitioned PubSub Log",
    "round": 2,
    "set": "A",
    "questionNumber": 5,
    "domain": "Event Streaming",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Apache Kafka",
    "aliases": [
      "apache kafka",
      "kafka"
    ],
    "images": [
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "token"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "book_library"
      }
    ],
    "explanation": "Literary Author Kafka + Event Pipeline = Apache Kafka.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-06",
    "title": "In-Memory Key-Value Datastore",
    "round": 2,
    "set": "A",
    "questionNumber": 6,
    "domain": "Caching Systems",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Redis Cache",
    "aliases": [
      "redis cache",
      "redis"
    ],
    "images": [
      "https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "puzzle_piece"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cache"
      }
    ],
    "explanation": "Red ember + Storage Cache = Redis Cache.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-07",
    "title": "Malicious Database Query Escape",
    "round": 2,
    "set": "A",
    "questionNumber": 7,
    "domain": "Cybersecurity",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "SQL Injection",
    "aliases": [
      "sql injection",
      "sqli"
    ],
    "images": [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "terminal"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "leak"
      }
    ],
    "explanation": "Database SQL Table + Syringe Injection = SQL Injection.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-08",
    "title": "Secure Channel Handshake Protocol",
    "round": 2,
    "set": "A",
    "questionNumber": 8,
    "domain": "Cryptography",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "TLS Handshake",
    "aliases": [
      "tls handshake",
      "ssl handshake"
    ],
    "images": [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "shield_check"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "arrows_sync"
      }
    ],
    "explanation": "Encrypted Lock + Handshake = TLS Handshake.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-09",
    "title": "Extortion Cryptographic Malware",
    "round": 2,
    "set": "A",
    "questionNumber": 9,
    "domain": "Cybersecurity",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Ransomware",
    "aliases": [
      "ransomware",
      "ransom ware"
    ],
    "images": [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "token"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cpu"
      }
    ],
    "explanation": "Extortion Ransom Lock + Digital Software = Ransomware.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-10",
    "title": "Leader Election Consensus Protocol",
    "round": 2,
    "set": "A",
    "questionNumber": 10,
    "domain": "Distributed Systems",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Raft Consensus",
    "aliases": [
      "raft consensus",
      "raft"
    ],
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "water_bucket"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "balance"
      }
    ],
    "explanation": "Water River Raft + Agreement Consensus = Raft Consensus.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-11",
    "title": "Client-Side Script Injection",
    "round": 2,
    "set": "A",
    "questionNumber": 11,
    "domain": "Web Security",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Cross Site Scripting",
    "aliases": [
      "cross site scripting",
      "xss"
    ],
    "images": [
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "road_deadlock"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "book_library"
      }
    ],
    "explanation": "Road Cross + Written Script = Cross Site Scripting.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-12",
    "title": "Public Certificate Authority Framework",
    "round": 2,
    "set": "A",
    "questionNumber": 12,
    "domain": "Security",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Public Key Infrastructure",
    "aliases": [
      "public key infrastructure",
      "pki"
    ],
    "images": [
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "network_mesh"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "key_lock"
      }
    ],
    "explanation": "Public Key + Architecture Infrastructure = Public Key Infrastructure.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-13",
    "title": "Full-Duplex Persistent TCP Socket",
    "round": 2,
    "set": "A",
    "questionNumber": 13,
    "domain": "Networking",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "WebSocket",
    "aliases": [
      "websocket",
      "web socket"
    ],
    "images": [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "network_mesh"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "wire_circuit"
      }
    ],
    "explanation": "Spider Web + Electrical Socket = WebSocket.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-14",
    "title": "Geographically Distributed Edge Cache",
    "round": 2,
    "set": "A",
    "questionNumber": 14,
    "domain": "Cloud Networking",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Content Delivery Network",
    "aliases": [
      "content delivery network",
      "cdn"
    ],
    "images": [
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "terminal"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "network_mesh"
      }
    ],
    "explanation": "Package Delivery + Global Network = Content Delivery Network.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-15",
    "title": "Cascading Failure Trip Switch",
    "round": 2,
    "set": "A",
    "questionNumber": 15,
    "domain": "Resiliency Patterns",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Circuit Breaker",
    "aliases": [
      "circuit breaker",
      "breaker"
    ],
    "images": [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "wire_circuit"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "lightning"
      }
    ],
    "explanation": "Electronic Circuit + Fracture Breaker = Circuit Breaker.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-16",
    "title": "Asynchronous Pub/Sub Pipeline",
    "round": 2,
    "set": "A",
    "questionNumber": 16,
    "domain": "Software Architecture",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Event Driven Architecture",
    "aliases": [
      "event driven architecture",
      "eda"
    ],
    "images": [
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "token"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cube_grid"
      }
    ],
    "explanation": "Calendar Event + Driven Gear = Event Driven Architecture.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-17",
    "title": "Cryptographic Hash Binary Tree",
    "round": 2,
    "set": "A",
    "questionNumber": 17,
    "domain": "Cryptography",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Merkle Tree",
    "aliases": [
      "merkle tree",
      "hash tree"
    ],
    "images": [
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "key_lock"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "tree"
      }
    ],
    "explanation": "Cryptographic Hash + Forest Tree = Merkle Tree.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-18",
    "title": "Stateless Signed Claims Token",
    "round": 2,
    "set": "A",
    "questionNumber": 18,
    "domain": "Security",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "JSON Web Token",
    "aliases": [
      "json web token",
      "jwt"
    ],
    "images": [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "shield_check"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "token"
      }
    ],
    "explanation": "World Wide Web + Golden Token = JSON Web Token.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-19",
    "title": "Horizontal Partitioning of Database",
    "round": 2,
    "set": "A",
    "questionNumber": 19,
    "domain": "Databases",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Database Sharding",
    "aliases": [
      "database sharding",
      "sharding"
    ],
    "images": [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "cpu"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "puzzle_piece"
      }
    ],
    "explanation": "Database Rack + Shattered Shards = Database Sharding.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-20",
    "title": "Declarative Graph Query Language",
    "round": 2,
    "set": "A",
    "questionNumber": 20,
    "domain": "API Design",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "GraphQL",
    "aliases": [
      "graphql",
      "graph ql"
    ],
    "images": [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "network_mesh"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "search_glass"
      }
    ],
    "explanation": "Node Graph + Query Language = GraphQL.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-21",
    "title": "Lightweight Operating System Container",
    "round": 2,
    "set": "A",
    "questionNumber": 21,
    "domain": "Containerization",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Docker Container",
    "aliases": [
      "docker container",
      "docker"
    ],
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "token"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cube_grid"
      }
    ],
    "explanation": "Harbor Dock + Cargo Container = Docker Container.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-22",
    "title": "Network Eavesdropping Interception",
    "round": 2,
    "set": "A",
    "questionNumber": 22,
    "domain": "Cybersecurity",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Man in the Middle Attack",
    "aliases": [
      "man in the middle attack",
      "mitm attack",
      "mitm"
    ],
    "images": [
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "search_glass"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "wire_circuit"
      }
    ],
    "explanation": "Person in the Middle + Eavesdropping wire = Man in the Middle Attack.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-23",
    "title": "Truth Verification without Revealing Secret",
    "round": 2,
    "set": "A",
    "questionNumber": 23,
    "domain": "Cryptography",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Zero Knowledge Proof",
    "aliases": [
      "zero knowledge proof",
      "zkp",
      "zk-snark"
    ],
    "images": [
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "token"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "balance"
      }
    ],
    "explanation": "Zero knowledge + Evidentiary Proof = Zero Knowledge Proof.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-24",
    "title": "Classic Byzantine Consensus Algorithm",
    "round": 2,
    "set": "A",
    "questionNumber": 24,
    "domain": "Distributed Systems",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Paxos",
    "aliases": [
      "paxos",
      "paxos algorithm"
    ],
    "images": [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "balance"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "tree"
      }
    ],
    "explanation": "Greek Island Pax + Legislative Quorum = Paxos.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-25",
    "title": "Central Entrypoint Reverse Proxy",
    "round": 2,
    "set": "A",
    "questionNumber": 25,
    "domain": "Microservices",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "API Gateway",
    "aliases": [
      "api gateway",
      "gateway"
    ],
    "images": [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "terminal"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "key_lock"
      }
    ],
    "explanation": "API Protocol + Castle Gateway = API Gateway.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-26",
    "title": "Cluster Network Partition Dual Master",
    "round": 2,
    "set": "A",
    "questionNumber": 26,
    "domain": "Distributed Systems",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Split Brain",
    "aliases": [
      "split brain",
      "split brain syndrome"
    ],
    "images": [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "brain"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "lightning"
      }
    ],
    "explanation": "Split Fissure + Cognitive Brain = Split Brain.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-27",
    "title": "Immutable Cryptographic Ledger",
    "round": 2,
    "set": "A",
    "questionNumber": 27,
    "domain": "Distributed Ledgers",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Blockchain",
    "aliases": [
      "blockchain",
      "block chain"
    ],
    "images": [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "cube_grid"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "wire_circuit"
      }
    ],
    "explanation": "Solid Block + Linked Chain = Blockchain.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-28",
    "title": "Mathematical Noise Privacy Preservation",
    "round": 2,
    "set": "A",
    "questionNumber": 28,
    "domain": "Data Privacy",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Differential Privacy",
    "aliases": [
      "differential privacy",
      "diff privacy"
    ],
    "images": [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "balance"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "shield_check"
      }
    ],
    "explanation": "Differential math + Privacy Lock = Differential Privacy.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-29",
    "title": "Algebraic Curve Public Key Cryptosystem",
    "round": 2,
    "set": "A",
    "questionNumber": 29,
    "domain": "Cryptography",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Elliptic Curve Cryptography",
    "aliases": [
      "elliptic curve cryptography",
      "ecc"
    ],
    "images": [
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "wire_circuit"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "key_lock"
      }
    ],
    "explanation": "Elliptic Curve + Cryptographic Key = Elliptic Curve Cryptography.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r2-q30-30",
    "title": "Legacy Monolith Incremental Migration",
    "round": 2,
    "set": "A",
    "questionNumber": 30,
    "domain": "Software Architecture",
    "difficulty": "Hard",
    "points": 2,
    "correctAnswer": "Strangler Fig Pattern",
    "aliases": [
      "strangler fig pattern",
      "strangler pattern"
    ],
    "images": [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "tree"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cube_grid"
      }
    ],
    "explanation": "Strangler Fig Vine + Monolith Structure = Strangler Fig Pattern.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  }
];

export const ROUND_3_THIRTY_QUESTIONS: Question[] = [
  {
    "id": "r3-q30-01",
    "title": "Self-Attention Neural Architecture",
    "round": 3,
    "set": "A",
    "questionNumber": 1,
    "domain": "Deep Learning",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Transformer Model",
    "aliases": [
      "transformer model",
      "transformer"
    ],
    "images": [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "lightning"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "brain"
      }
    ],
    "explanation": "High Voltage Transformer + Neural Model = Transformer Model.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-02",
    "title": "Classical Infeasibility Milestone",
    "round": 3,
    "set": "A",
    "questionNumber": 2,
    "domain": "Quantum Computing",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Quantum Supremacy",
    "aliases": [
      "quantum supremacy",
      "quantum advantage"
    ],
    "images": [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "cpu"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "token"
      }
    ],
    "explanation": "Quantum Chip + Crown Supremacy = Quantum Supremacy.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-03",
    "title": "Dual Generator-Discriminator Game",
    "round": 3,
    "set": "A",
    "questionNumber": 3,
    "domain": "Generative AI",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Generative Adversarial Network",
    "aliases": [
      "generative adversarial network",
      "gan"
    ],
    "images": [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "puzzle_piece"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "search_glass"
      }
    ],
    "explanation": "Adversarial Contest + Neural Network = Generative Adversarial Network.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-04",
    "title": "Spooky Non-Local Particle Correlation",
    "round": 3,
    "set": "A",
    "questionNumber": 4,
    "domain": "Quantum Physics",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Quantum Entanglement",
    "aliases": [
      "quantum entanglement",
      "entanglement"
    ],
    "images": [
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "wire_circuit"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "arrows_sync"
      }
    ],
    "explanation": "Entangled Chains + Quantum Light = Quantum Entanglement.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-05",
    "title": "Human Preference Reward Tuning",
    "round": 3,
    "set": "A",
    "questionNumber": 5,
    "domain": "AI Alignment",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "RLHF",
    "aliases": [
      "rlhf",
      "reinforcement learning from human feedback"
    ],
    "images": [
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "token"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "shield_check"
      }
    ],
    "explanation": "Human Feedback + Reinforcement Brain = RLHF.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-06",
    "title": "Loss Function Optimization Trajectory",
    "round": 3,
    "set": "A",
    "questionNumber": 6,
    "domain": "Machine Learning",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Gradient Descent",
    "aliases": [
      "gradient descent",
      "sgd"
    ],
    "images": [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "balance"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "wire_circuit"
      }
    ],
    "explanation": "Mountain Gradient slope + Downward Descent = Gradient Descent.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-07",
    "title": "Filter Kernel Grid Feature Extractor",
    "round": 3,
    "set": "A",
    "questionNumber": 7,
    "domain": "Computer Vision",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Convolutional Neural Network",
    "aliases": [
      "convolutional neural network",
      "cnn"
    ],
    "images": [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "cube_grid"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "brain"
      }
    ],
    "explanation": "Convolution Matrix Grid + Neural Cortex = Convolutional Neural Network.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-08",
    "title": "Training Data Memorization Pathology",
    "round": 3,
    "set": "A",
    "questionNumber": 8,
    "domain": "Machine Learning",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Overfitting",
    "aliases": [
      "overfitting",
      "overfit"
    ],
    "images": [
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "puzzle_piece"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "wire_circuit"
      }
    ],
    "explanation": "Too Tight Fit + Curve Fitting = Overfitting.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-09",
    "title": "External Knowledge Fact Injection",
    "round": 3,
    "set": "A",
    "questionNumber": 9,
    "domain": "Large Language Models",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Retrieval Augmented Generation",
    "aliases": [
      "retrieval augmented generation",
      "rag"
    ],
    "images": [
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "book_library"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "gear_spin"
      }
    ],
    "explanation": "Document Retrieval + Text Generation = Retrieval Augmented Generation.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-10",
    "title": "Zero Resistance Josephson Qubit",
    "round": 3,
    "set": "A",
    "questionNumber": 10,
    "domain": "Quantum Hardware",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Superconducting Qubit",
    "aliases": [
      "superconducting qubit",
      "superconducting transmon qubit"
    ],
    "images": [
      "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "lightning"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cpu"
      }
    ],
    "explanation": "Cryogenic Superconductor + Quantum Bit = Superconducting Qubit.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-11",
    "title": "Fluent Factual Fabrication",
    "round": 3,
    "set": "A",
    "questionNumber": 11,
    "domain": "Generative AI",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Model Hallucination",
    "aliases": [
      "model hallucination",
      "hallucination",
      "ai hallucination"
    ],
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "search_glass"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "brain"
      }
    ],
    "explanation": "Dream Mirage + AI Model = Model Hallucination.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-12",
    "title": "Google ASIC Matrix Multiplier",
    "round": 3,
    "set": "A",
    "questionNumber": 12,
    "domain": "Hardware Acceleration",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Tensor Processing Unit",
    "aliases": [
      "tensor processing unit",
      "tpu"
    ],
    "images": [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "cube_grid"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cpu"
      }
    ],
    "explanation": "Tensor Matrix Grid + Processing Chip = Tensor Processing Unit.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-13",
    "title": "Spike-Based Brain Silicon Architecture",
    "round": 3,
    "set": "A",
    "questionNumber": 13,
    "domain": "Biomorphic Computing",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Neuromorphic Computing",
    "aliases": [
      "neuromorphic computing",
      "neuromorphic chip"
    ],
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "brain"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "wire_circuit"
      }
    ],
    "explanation": "Biological Neuron + Silicon Computing = Neuromorphic Computing.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-14",
    "title": "Self-Deciding Goal-Seeking Entity",
    "round": 3,
    "set": "A",
    "questionNumber": 14,
    "domain": "Autonomous Systems",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Autonomous Agent",
    "aliases": [
      "autonomous agent",
      "ai agent"
    ],
    "images": [
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "gear_spin"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "shield_check"
      }
    ],
    "explanation": "Self-Driving Autonomy + Secret Agent = Autonomous Agent.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-15",
    "title": "Polynomial-Time Prime Factoring",
    "round": 3,
    "set": "A",
    "questionNumber": 15,
    "domain": "Quantum Algorithms",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Shor Algorithm",
    "aliases": [
      "shor algorithm",
      "shors algorithm"
    ],
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "water_bucket"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "key_lock"
      }
    ],
    "explanation": "Ocean Shore + Cryptographic Lock = Shor Algorithm.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-16",
    "title": "High-Dimensional Embedding Index",
    "round": 3,
    "set": "A",
    "questionNumber": 16,
    "domain": "Vector Search",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Vector Database",
    "aliases": [
      "vector database",
      "vector db"
    ],
    "images": [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "wire_circuit"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cpu"
      }
    ],
    "explanation": "Directional Vector + Database Server = Vector Database.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-17",
    "title": "Lattice-Based Post-Quantum Shield",
    "round": 3,
    "set": "A",
    "questionNumber": 17,
    "domain": "Post-Quantum Cryptography",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Post Quantum Cryptography",
    "aliases": [
      "post quantum cryptography",
      "pqc"
    ],
    "images": [
      "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "token"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "shield_check"
      }
    ],
    "explanation": "Mail Post + Quantum Cryptographic Shield = Post Quantum Cryptography.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-18",
    "title": "Reverse Denoising Image Synthesis",
    "round": 3,
    "set": "A",
    "questionNumber": 18,
    "domain": "Generative AI",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Diffusion Model",
    "aliases": [
      "diffusion model",
      "diffusion",
      "stable diffusion"
    ],
    "images": [
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "leak"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "puzzle_piece"
      }
    ],
    "explanation": "Ink Diffusion in fluid + Synthesis Model = Diffusion Model.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-19",
    "title": "Dynamic Programming Value Recursion",
    "round": 3,
    "set": "A",
    "questionNumber": 19,
    "domain": "Reinforcement Learning",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Bellman Equation",
    "aliases": [
      "bellman equation",
      "bellman optimality equation"
    ],
    "images": [
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "clock"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "balance"
      }
    ],
    "explanation": "Brass Bell + Mathematical Equation = Bellman Equation.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-20",
    "title": "Target Localization Enclosure",
    "round": 3,
    "set": "A",
    "questionNumber": 20,
    "domain": "Object Detection",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Bounding Box",
    "aliases": [
      "bounding box",
      "bbox"
    ],
    "images": [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "book_library"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cube_grid"
      }
    ],
    "explanation": "Bounding leap + Enclosing Box = Bounding Box.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-21",
    "title": "Quadratic Unstructured Search Speedup",
    "round": 3,
    "set": "A",
    "questionNumber": 21,
    "domain": "Quantum Search",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Grover Algorithm",
    "aliases": [
      "grover algorithm",
      "grovers search"
    ],
    "images": [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "tree"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "search_glass"
      }
    ],
    "explanation": "Forest Grove + Quantum Search = Grover Algorithm.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-22",
    "title": "Contextual Query Crafting",
    "round": 3,
    "set": "A",
    "questionNumber": 22,
    "domain": "AI Interface Design",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Prompt Engineering",
    "aliases": [
      "prompt engineering",
      "prompting"
    ],
    "images": [
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "clock"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "wrench_tool"
      }
    ],
    "explanation": "Prompt Call + Tool Engineering = Prompt Engineering.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-23",
    "title": "Simultaneous Map & Position Estimation",
    "round": 3,
    "set": "A",
    "questionNumber": 23,
    "domain": "Robotics",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "SLAM",
    "aliases": [
      "slam",
      "simultaneous localization and mapping"
    ],
    "images": [
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "lightning"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cube_grid"
      }
    ],
    "explanation": "Slam Impact + Robotic Map = SLAM.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-24",
    "title": "Dense Semantic Word Embeddings",
    "round": 3,
    "set": "A",
    "questionNumber": 24,
    "domain": "Natural Language Processing",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Word2Vec",
    "aliases": [
      "word2vec",
      "word to vec"
    ],
    "images": [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "book_library"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "wire_circuit"
      }
    ],
    "explanation": "Printed Word + Numeric Vector = Word2Vec.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-25",
    "title": "Microcontroller Quantized Neural Inference",
    "round": 3,
    "set": "A",
    "questionNumber": 25,
    "domain": "Edge AI",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "TinyML",
    "aliases": [
      "tinyml",
      "tiny ml"
    ],
    "images": [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "puzzle_piece"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cpu"
      }
    ],
    "explanation": "Tiny size + Machine Learning Chip = TinyML.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-26",
    "title": "Teacher-Student Neural Compression",
    "round": 3,
    "set": "A",
    "questionNumber": 26,
    "domain": "Model Compression",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Knowledge Distillation",
    "aliases": [
      "knowledge distillation",
      "distillation"
    ],
    "images": [
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "book_library"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "leak"
      }
    ],
    "explanation": "Library Knowledge + Laboratory Distillation = Knowledge Distillation.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-27",
    "title": "Contrastive Vision-Language Alignment",
    "round": 3,
    "set": "A",
    "questionNumber": 27,
    "domain": "Multimodal AI",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "CLIP Model",
    "aliases": [
      "clip model",
      "clip",
      "contrastive language image pretraining"
    ],
    "images": [
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "wire_circuit"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cube_grid"
      }
    ],
    "explanation": "Metal Binder Clip + Multimodal Model = CLIP Model.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-28",
    "title": "Speed-of-Light Laser Photonic Matrix",
    "round": 3,
    "set": "A",
    "questionNumber": 28,
    "domain": "Optical Computing",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Photonic Computing",
    "aliases": [
      "photonic computing",
      "optical computing"
    ],
    "images": [
      "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "lightning"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "cpu"
      }
    ],
    "explanation": "Laser Photons + Silicon Computing = Photonic Computing.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-29",
    "title": "Sparse Conditional Subnetwork Routing",
    "round": 3,
    "set": "A",
    "questionNumber": 29,
    "domain": "Neural Architecture",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Mixture of Experts",
    "aliases": [
      "mixture of experts",
      "moe"
    ],
    "images": [
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "leak"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "brain"
      }
    ],
    "explanation": "Blend Mixture + Specialist Experts = Mixture of Experts.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  },
  {
    "id": "r3-q30-30",
    "title": "Human-Parity Cross-Domain Cognition",
    "round": 3,
    "set": "A",
    "questionNumber": 30,
    "domain": "Frontier AI",
    "difficulty": "Very Hard",
    "points": 3,
    "correctAnswer": "Artificial General Intelligence",
    "aliases": [
      "artificial general intelligence",
      "agi"
    ],
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
    ],
    "customImageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "cluePanels": [
      {
        "panelNumber": 1,
        "description": "",
        "svgType": "brain"
      },
      {
        "panelNumber": 2,
        "description": "",
        "svgType": "shield_check"
      }
    ],
    "explanation": "Synthetic Intellect + Universal Scope = Artificial General Intelligence.",
    "active": true,
    "rebusFormulaText": "Panel 1 + Panel 2"
  }
];

export const MASTER_THIRTY_QUESTIONS_ALL: Question[] = [
  ...ROUND_1_THIRTY_QUESTIONS,
  ...ROUND_2_THIRTY_QUESTIONS,
  ...ROUND_3_THIRTY_QUESTIONS,
];
