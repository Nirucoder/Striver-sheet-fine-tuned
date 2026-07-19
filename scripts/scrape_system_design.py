#!/usr/bin/env python3
"""
scrape_system_design.py
=======================
Generates system_design_data.json for the StudyOS System Design Tracker.

Behaviour:
  1. Uses ARTICLE_MAP — a hardcoded dict mapping exact topic titles to their
     verified takeUforward article slugs.
  2. Uses VIDEO_MAP — hardcoded Gaurav Sen YouTube video IDs that match
     each topic. If a YOUTUBE_API_KEY env-var is set the script will also
     try to verify / replace IDs by querying the YouTube Data API v3 with
     the search term  "takeuforward <topic_title>"  against the channel
     UC0RhatS1pyxInC00YKjjBqQ  (takeUforward / Striver).
  3. Writes public/system_design_data.json (relative to repo root).

Usage:
  python scripts/scrape_system_design.py
  YOUTUBE_API_KEY=YOUR_KEY python scripts/scrape_system_design.py
"""

import json
import os
import sys
import urllib.request
import urllib.parse

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT   = os.path.dirname(SCRIPT_DIR)
OUTPUT_PATH = os.path.join(REPO_ROOT, "public", "system_design_data.json")

# ─── Constants ────────────────────────────────────────────────────────────────
TUF_SD_ROOT = "https://takeuforward.org/system-design/"
TUF_SD_ROADMAP = TUF_SD_ROOT + "complete-system-design-roadmap-with-videos-for-sdes/"

# takeUforward YouTube channel ID (Striver's channel)
TUF_CHANNEL_ID = "UC0RhatS1pyxInC00YKjjBqQ"

# ─── Hardcoded Article URL Map ────────────────────────────────────────────────
# Maps exact topic title  →  verified TUF article URL.
# For topics without a dedicated TUF page the roadmap index is used as fallback.
ARTICLE_MAP = {
    # ── Unit 1: Fundamentals ──────────────────────────────────────────────
    "System Design Primer: How to Start with Distributed Systems":
        TUF_SD_ROADMAP,
    "System Design for Beginners — Full Course":
        TUF_SD_ROADMAP,
    "Capacity Planning & Estimation: How Much Data Does YouTube Store Daily?":
        TUF_SD_ROOT + "capacity-planning-estimation-how-much-data-does-youtube-store-daily/",
    "Latency, Concurrency & Parallelism: How 100ms Cost Amazon $3B":
        TUF_SD_ROOT + "latency-concurrency-parallelism-how-100ms-cost-amazon-3b/",
    "What is an API and How Do You Design It?":
        TUF_SD_ROOT + "what-is-an-api-and-how-do-you-design-it/",

    # ── Unit 2: Scalability & Reliability ────────────────────────────────
    "System Design BASICS: Horizontal vs. Vertical Scaling":
        TUF_SD_ROOT + "horizontal-vs-vertical-scaling-system-design/",
    "Data Consistency and Trade-offs in Distributed Systems":
        TUF_SD_ROOT + "data-consistency-and-trade-offs-in-distributed-systems/",
    "Distributed Consensus and Data Replication Strategies":
        TUF_SD_ROOT + "distributed-consensus-and-data-replication-strategies/",
    "How to Avoid a Single Point of Failure in Distributed Systems":
        TUF_SD_ROOT + "how-to-avoid-a-single-point-of-failure-in-distributed-systems/",
    "How to Avoid Cascading Failures in a Distributed System":
        TUF_SD_ROOT + "how-to-avoid-cascading-failures-in-a-distributed-system/",

    # ── Unit 3: Core Building Blocks ──────────────────────────────────────
    "What is LOAD BALANCING?":
        TUF_SD_ROOT + "what-is-load-balancing/",
    "System Design: Content Delivery Networks (CDN) Simplified":
        TUF_SD_ROOT + "what-is-content-delivery-network-cdn/",
    "Containers and Virtualisation in Cloud Computing":
        TUF_SD_ROOT + "containers-and-virtualisation-in-cloud-computing/",
    "Service Discovery and Heartbeats in Micro-Services":
        TUF_SD_ROOT + "service-discovery-and-heartbeats-in-micro-services/",
    "Authorization across Distributed Systems: The OAuth Protocol":
        TUF_SD_ROOT + "authorization-across-distributed-systems-the-oauth-protocol/",

    # ── Unit 4: Databases & Storage ───────────────────────────────────────
    "Introduction to NoSQL Databases":
        TUF_SD_ROOT + "introduction-to-nosql-databases/",
    "Relational Database Index vs. NoSQL Index":
        TUF_SD_ROOT + "relational-database-index-vs-nosql-index/",
    "What is DATABASE SHARDING?":
        TUF_SD_ROOT + "what-is-sharding/",
    "What is CONSISTENT HASHING and Where is it Used?":
        TUF_SD_ROOT + "what-is-consistent-hashing/",
    "What are Bloom Filters? — Hashing":
        TUF_SD_ROOT + "what-are-bloom-filters/",
    "Why Do Databases Fail? Anti-Patterns to Avoid!":
        TUF_SD_ROOT + "why-do-databases-fail-anti-patterns-to-avoid/",
    "How Databases Scale Writes: The Power of the Log":
        TUF_SD_ROOT + "how-databases-scale-writes-the-power-of-the-log/",
    "Designing a Location Database: QuadTrees and Hilbert Curves":
        TUF_SD_ROOT + "designing-a-location-database-quadtrees-and-hilbert-curves/",

    # ── Unit 5: Caching ───────────────────────────────────────────────────
    "What are Distributed CACHES and How Do They Manage Data Consistency?":
        TUF_SD_ROOT + "what-are-distributed-caches-and-how-do-they-manage-data-consistency/",

    # ── Unit 6: Messaging & Async Processing ─────────────────────────────
    "What is a MESSAGE QUEUE and Where is it Used?":
        TUF_SD_ROOT + "what-is-a-message-queue-and-where-is-it-used/",
    "What is the Publisher Subscriber (Pub/Sub) Model?":
        TUF_SD_ROOT + "what-is-publisher-subscriber-pub-sub-model/",
    "What's an Event Driven System?":
        TUF_SD_ROOT + "whats-an-event-driven-system/",

    # ── Unit 7: Microservices & Architecture Patterns ─────────────────────
    "What is a MICROSERVICE ARCHITECTURE and What are its Advantages?":
        TUF_SD_ROOT + "what-is-a-microservice-architecture-and-what-are-its-advantages/",
    "Moving from MONOLITHS to MICROSERVICES":
        TUF_SD_ROOT + "moving-from-monoliths-to-microservices/",

    # ── Unit 8: System Design Case Studies ───────────────────────────────
    "Designing INSTAGRAM: System Design of News Feed":
        TUF_SD_ROOT + "designing-instagram-system-design-of-news-feed/",
    "System Design: TINDER as a Microservice Architecture":
        TUF_SD_ROOT + "system-design-tinder-as-a-microservice-architecture/",
    "WHATSAPP System Design: Chat Messaging Systems for Interviews":
        TUF_SD_ROOT + "whatsapp-system-design-chat-messaging-systems-for-interviews/",
    "System Design Interview: TikTok Architecture":
        TUF_SD_ROOT + "system-design-interview-tiktok-architecture/",
    "How NETFLIX Onboards New Content: Video Processing at Scale":
        TUF_SD_ROOT + "how-netflix-onboards-new-content-video-processing-at-scale/",
    "System Design: Online Judge for Coding Contests":
        TUF_SD_ROOT + "system-design-online-judge-for-coding-contests/",
    "System Design of an Online Code Editor":
        TUF_SD_ROOT + "system-design-of-an-online-code-editor/",
    "UPI System Design Mock Interview":
        TUF_SD_ROOT + "upi-system-design-mock-interview/",
    "IRCTC System Design — Expert Mock Interview":
        TUF_SD_ROOT + "irctc-system-design-expert-mock-interview/",
    "Zerodha Stock Broker System Design":
        TUF_SD_ROOT + "zerodha-stock-broker-system-design/",
    "System Design Interview: Amazon / Flipkart E-Commerce Architecture":
        TUF_SD_ROOT + "system-design-interview-amazon-flipkart-e-commerce-architecture/",
}

# ─── Hardcoded Video ID Map ───────────────────────────────────────────────────
# These are the verified Gaurav Sen video IDs.
# If YOUTUBE_API_KEY is set the script will try to override these with fresh
# results from the YouTube Data API using query  "takeuforward <title>".
VIDEO_MAP = {
    # Unit 1
    "System Design Primer: How to Start with Distributed Systems": "SqcXvc3ZmRU",
    "System Design for Beginners — Full Course":                   "m8Icp_Cid5o",
    "Capacity Planning & Estimation: How Much Data Does YouTube Store Daily?": "0myM0k1mjZw",
    "Latency, Concurrency & Parallelism: How 100ms Cost Amazon $3B": "I8FeITQvLAk",
    "What is an API and How Do You Design It?":                    "_YlYuNMTCc8",
    # Unit 2
    "System Design BASICS: Horizontal vs. Vertical Scaling":       "xpDnVSmNFX0",
    "Data Consistency and Trade-offs in Distributed Systems":      "m4q7VkgDWrM",
    "Distributed Consensus and Data Replication Strategies":       "GeGxgmPTe4c",
    "How to Avoid a Single Point of Failure in Distributed Systems": "-BOysyYErLY",
    "How to Avoid Cascading Failures in a Distributed System":     "xrizarXJgC8",
    # Unit 3
    "What is LOAD BALANCING?":                                     "K0Ta65OqQkY",
    "System Design: Content Delivery Networks (CDN) Simplified":   "8zX0rue2Hic",
    "Containers and Virtualisation in Cloud Computing":            "GOuVeZmMee0",
    "Service Discovery and Heartbeats in Micro-Services":          "lWE_UIbm8NA",
    "Authorization across Distributed Systems: The OAuth Protocol":"65-6asTjuB8",
    # Unit 4
    "Introduction to NoSQL Databases":                             "xQnIN9bW0og",
    "Relational Database Index vs. NoSQL Index":                   "mTNkqMDCasI",
    "What is DATABASE SHARDING?":                                  "5faMjKuB9bc",
    "What is CONSISTENT HASHING and Where is it Used?":            "zaRkONvyGr8",
    "What are Bloom Filters? — Hashing":                           "bgzUdBVr5tE",
    "Why Do Databases Fail? Anti-Patterns to Avoid!":              "9T-gNZ5bGCw",
    "How Databases Scale Writes: The Power of the Log":            "_5vrfuwhvlQ",
    "Designing a Location Database: QuadTrees and Hilbert Curves": "OcUKFIjhKu0",
    # Unit 5
    "What are Distributed CACHES and How Do They Manage Data Consistency?": "U3RkDLtS7uY",
    # Unit 6
    "What is a MESSAGE QUEUE and Where is it Used?":               "oUJbuFMyBDk",
    "What is the Publisher Subscriber (Pub/Sub) Model?":           "FMhbR_kQeHw",
    "What's an Event Driven System?":                              "rJHTK2TfZ1I",
    # Unit 7
    "What is a MICROSERVICE ARCHITECTURE and What are its Advantages?": "qYhRvH9tJKw",
    "Moving from MONOLITHS to MICROSERVICES":                      "rckfN7xFig0",
    # Unit 8
    "Designing INSTAGRAM: System Design of News Feed":             "QmX2NPkJTKg",
    "System Design: TINDER as a Microservice Architecture":        "tndzLznxq40",
    "WHATSAPP System Design: Chat Messaging Systems for Interviews":"vvhC64hQZMk",
    "System Design Interview: TikTok Architecture":                "07BVxmVFDGY",
    "How NETFLIX Onboards New Content: Video Processing at Scale": "x9Hrn0oNmJM",
    "System Design: Online Judge for Coding Contests":             "eg0nlYcbLpo",
    "System Design of an Online Code Editor":                      "07jkn4jUtso",
    "UPI System Design Mock Interview":                            "QpLy0_c_RXk",
    "IRCTC System Design — Expert Mock Interview":                 "j3etJx7M0Sc",
    "Zerodha Stock Broker System Design":                          "DH2-vDPFiE4",
    "System Design Interview: Amazon / Flipkart E-Commerce Architecture": "2BWr0fsDSs0",
}

# ─── Unit / topic skeleton ────────────────────────────────────────────────────
SD_UNITS_SKELETON = [
    {
        "unit": 1,
        "title": "Fundamentals of System Design",
        "topics": [
            "System Design Primer: How to Start with Distributed Systems",
            "System Design for Beginners — Full Course",
            "Capacity Planning & Estimation: How Much Data Does YouTube Store Daily?",
            "Latency, Concurrency & Parallelism: How 100ms Cost Amazon $3B",
            "What is an API and How Do You Design It?",
        ],
    },
    {
        "unit": 2,
        "title": "Scalability & Reliability",
        "topics": [
            "System Design BASICS: Horizontal vs. Vertical Scaling",
            "Data Consistency and Trade-offs in Distributed Systems",
            "Distributed Consensus and Data Replication Strategies",
            "How to Avoid a Single Point of Failure in Distributed Systems",
            "How to Avoid Cascading Failures in a Distributed System",
        ],
    },
    {
        "unit": 3,
        "title": "Core Building Blocks",
        "topics": [
            "What is LOAD BALANCING?",
            "System Design: Content Delivery Networks (CDN) Simplified",
            "Containers and Virtualisation in Cloud Computing",
            "Service Discovery and Heartbeats in Micro-Services",
            "Authorization across Distributed Systems: The OAuth Protocol",
        ],
    },
    {
        "unit": 4,
        "title": "Databases & Storage",
        "topics": [
            "Introduction to NoSQL Databases",
            "Relational Database Index vs. NoSQL Index",
            "What is DATABASE SHARDING?",
            "What is CONSISTENT HASHING and Where is it Used?",
            "What are Bloom Filters? — Hashing",
            "Why Do Databases Fail? Anti-Patterns to Avoid!",
            "How Databases Scale Writes: The Power of the Log",
            "Designing a Location Database: QuadTrees and Hilbert Curves",
        ],
    },
    {
        "unit": 5,
        "title": "Caching",
        "topics": [
            "What are Distributed CACHES and How Do They Manage Data Consistency?",
        ],
    },
    {
        "unit": 6,
        "title": "Messaging & Async Processing",
        "topics": [
            "What is a MESSAGE QUEUE and Where is it Used?",
            "What is the Publisher Subscriber (Pub/Sub) Model?",
            "What's an Event Driven System?",
        ],
    },
    {
        "unit": 7,
        "title": "Microservices & Architecture Patterns",
        "topics": [
            "What is a MICROSERVICE ARCHITECTURE and What are its Advantages?",
            "Moving from MONOLITHS to MICROSERVICES",
        ],
    },
    {
        "unit": 8,
        "title": "System Design Case Studies",
        "topics": [
            "Designing INSTAGRAM: System Design of News Feed",
            "System Design: TINDER as a Microservice Architecture",
            "WHATSAPP System Design: Chat Messaging Systems for Interviews",
            "System Design Interview: TikTok Architecture",
            "How NETFLIX Onboards New Content: Video Processing at Scale",
            "System Design: Online Judge for Coding Contests",
            "System Design of an Online Code Editor",
            "UPI System Design Mock Interview",
            "IRCTC System Design — Expert Mock Interview",
            "Zerodha Stock Broker System Design",
            "System Design Interview: Amazon / Flipkart E-Commerce Architecture",
        ],
    },
]


# ─── Optional: YouTube Data API search ───────────────────────────────────────
def youtube_search(api_key: str, topic_title: str) -> str | None:
    """
    Search YouTube Data API v3 for  "takeuforward <topic_title>"
    and return the best-matching videoId, or None on failure.
    """
    query = f"takeuforward {topic_title}"
    params = urllib.parse.urlencode({
        "part":       "snippet",
        "q":          query,
        "channelId":  TUF_CHANNEL_ID,
        "type":       "video",
        "maxResults": 1,
        "key":        api_key,
    })
    url = f"https://www.googleapis.com/youtube/v3/search?{params}"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read())
        items = data.get("items", [])
        if items:
            vid_id = items[0]["id"].get("videoId")
            if vid_id:
                print(f"  ✓ YouTube found '{vid_id}' for: {topic_title[:60]}")
                return vid_id
    except Exception as exc:
        print(f"  ⚠ YouTube API error for '{topic_title[:50]}': {exc}", file=sys.stderr)
    return None


# ─── Main ─────────────────────────────────────────────────────────────────────
def build_data() -> list:
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    result  = []

    for unit in SD_UNITS_SKELETON:
        videos = []
        for title in unit["topics"]:
            # 1. Article URL — from hardcoded map, fallback to roadmap index
            article_url = ARTICLE_MAP.get(title, TUF_SD_ROADMAP)

            # 2. Video ID — optionally refresh via YouTube API
            vid_id = VIDEO_MAP.get(title, "")
            if api_key and title in VIDEO_MAP:
                fresh = youtube_search(api_key, title)
                if fresh:
                    vid_id = fresh

            videos.append({
                "title":       title,
                "video_id":    vid_id,
                "video_url":   f"https://www.youtube.com/watch?v={vid_id}" if vid_id else "",
                "article_url": article_url,
            })

        result.append({
            "unit":   unit["unit"],
            "title":  unit["title"],
            "videos": videos,
        })

    return result


def main():
    print("Building system_design_data.json …")
    data = build_data()

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    total = sum(len(u["videos"]) for u in data)
    print(f"✓ Written {len(data)} units / {total} topics → {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
