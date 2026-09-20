from typing import Optional, Dict, Any, List

# Simulated Gujarat PDS (Food & Civil Supplies) and UIDAI Aadhaar registry records
MOCK_PDS_AADHAAR_DATABASE: List[Dict[str, Any]] = [
    {
        "aadhaar_raw": "987654321012",
        "aadhaar_masked": "XXXX-XXXX-1012",
        "ration_card_no": "RC-GJ-0982341",
        "head_name": "Priya Sharma",
        "district": "Gandhinagar",
        "income": 180000.0,
        "category": "OBC",
        "members": [
            {"name": "Priya Sharma", "age": 36, "gender": "Female", "relation": "head", "occupation": "Handicraft Artisan"},
            {"name": "Rajesh Sharma", "age": 39, "gender": "Male", "relation": "spouse", "occupation": "Agritech Operator"},
            {"name": "Aarav Sharma", "age": 15, "gender": "Male", "relation": "child", "occupation": "Student (Class 10)"},
            {"name": "Sunita Devi", "age": 64, "gender": "Female", "relation": "parent", "occupation": "Homemaker"}
        ]
    },
    {
        "aadhaar_raw": "234567890123",
        "aadhaar_masked": "XXXX-XXXX-0123",
        "ration_card_no": "RC-GJ-4481920",
        "head_name": "Ramesh Patel",
        "district": "Ahmedabad",
        "income": 120000.0,
        "category": "BPL",
        "members": [
            {"name": "Ramesh Patel", "age": 42, "gender": "Male", "relation": "head", "occupation": "Daily Wage Worker"},
            {"name": "Geeta Patel", "age": 38, "gender": "Female", "relation": "spouse", "occupation": "Tailor"},
            {"name": "Kavita Patel", "age": 16, "gender": "Female", "relation": "child", "occupation": "Student (Class 11)"}
        ]
    },
    {
        "aadhaar_raw": "345678901234",
        "aadhaar_masked": "XXXX-XXXX-1234",
        "ration_card_no": "RC-GJ-5519821",
        "head_name": "Jignesh Vaghela",
        "district": "Rajkot",
        "income": 95000.0,
        "category": "SC",
        "members": [
            {"name": "Jignesh Vaghela", "age": 45, "gender": "Male", "relation": "head", "occupation": "Electrician"},
            {"name": "Meena Vaghela", "age": 41, "gender": "Female", "relation": "spouse", "occupation": "Homemaker"},
            {"name": "Nilesh Vaghela", "age": 19, "gender": "Male", "relation": "child", "occupation": "College Student (UG-1)"}
        ]
    },
    {
        "aadhaar_raw": "456789012345",
        "aadhaar_masked": "XXXX-XXXX-2345",
        "ration_card_no": "RC-GJ-7718290",
        "head_name": "Hareshbhai Rathod",
        "district": "Surat",
        "income": 320000.0,
        "category": "SEBC",
        "members": [
            {"name": "Hareshbhai Rathod", "age": 38, "gender": "Male", "relation": "head", "occupation": "Diamond Polisher"},
            {"name": "Bhavna Rathod", "age": 35, "gender": "Female", "relation": "spouse", "occupation": "Textile Designer"},
            {"name": "Rohan Rathod", "age": 14, "gender": "Male", "relation": "child", "occupation": "Student (Class 9)"},
            {"name": "Sneha Rathod", "age": 10, "gender": "Female", "relation": "child", "occupation": "Student (Class 5)"}
        ]
    },
    {
        "aadhaar_raw": "567890123456",
        "aadhaar_masked": "XXXX-XXXX-3456",
        "ration_card_no": "RC-GJ-8821901",
        "head_name": "Dineshbhai Gamit",
        "district": "Tapi",
        "income": 80000.0,
        "category": "ST",
        "members": [
            {"name": "Dineshbhai Gamit", "age": 33, "gender": "Male", "relation": "head", "occupation": "Farmer"},
            {"name": "Sarojben Gamit", "age": 30, "gender": "Female", "relation": "spouse", "occupation": "Asha Worker"},
            {"name": "Pooja Gamit", "age": 7, "gender": "Female", "relation": "child", "occupation": "Student (Class 2)"}
        ]
    }
]

def lookup_mock_pds_aadhaar(identifier: str) -> Optional[Dict[str, Any]]:
    """
    Simulates lookup against Gujarat PDS (Ration Card) & UIDAI Aadhaar registry.
    Accepts 12-digit Aadhaar number or Ration Card number.
    """
    clean_id = identifier.strip().replace(" ", "").replace("-", "").upper()

    for record in MOCK_PDS_AADHAAR_DATABASE:
        if record["aadhaar_raw"] == clean_id:
            return record
        clean_rc = record["ration_card_no"].replace("-", "").upper()
        if clean_rc == clean_id or record["ration_card_no"].upper() == clean_id:
            return record

    return None
