#!/usr/bin/env python3
"""
Test script for AI Success Insights API
Run this after starting the server to verify all endpoints
"""

import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def test_health_check():
    print_section("Testing Health Check")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_csv_upload():
    print_section("Testing CSV Upload")
    csv_path = Path(__file__).parent / "sample_data.csv"
    
    if not csv_path.exists():
        print("❌ sample_data.csv not found")
        return False
    
    with open(csv_path, 'rb') as f:
        files = {'file': ('sample_data.csv', f, 'text/csv')}
        response = requests.post(f"{BASE_URL}/ingest/csv", files=files)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_list_accounts():
    print_section("Testing List Accounts")
    response = requests.get(f"{BASE_URL}/accounts?page=1&page_size=10")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total accounts: {data.get('total', 0)}")
    print(f"Accounts returned: {len(data.get('accounts', []))}")
    if data.get('accounts'):
        print(f"\nFirst account:")
        print(json.dumps(data['accounts'][0], indent=2))
    return response.status_code == 200

def test_filter_accounts():
    print_section("Testing Account Filters")
    
    # Test segment filter
    response = requests.get(f"{BASE_URL}/accounts?segment=Enterprise")
    print(f"Enterprise accounts: {response.json().get('total', 0)}")
    
    # Test bucket filter
    response = requests.get(f"{BASE_URL}/accounts?bucket=Critical")
    print(f"Critical accounts: {response.json().get('total', 0)}")
    
    return True

def test_account_detail():
    print_section("Testing Account Detail")
    response = requests.get(f"{BASE_URL}/accounts/1")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"\nAccount: {data.get('account_name')}")
        print(f"Health Score: {data.get('health_score')}")
        print(f"Health Bucket: {data.get('health_bucket')}")
        print(f"ARR: ${data.get('arr'):,.2f}")
        if data.get('trend_30d'):
            print(f"\n30-day trend:")
            print(json.dumps(data['trend_30d'], indent=2))
    return response.status_code == 200

def test_health_recompute():
    print_section("Testing Health Recompute")
    response = requests.post(f"{BASE_URL}/health/recompute")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_portfolio_summary():
    print_section("Testing Portfolio Summary")
    response = requests.get(f"{BASE_URL}/portfolio/summary")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"\nTotal Accounts: {data.get('total_accounts')}")
        print(f"Total ARR: ${data.get('total_arr'):,.2f}")
        print(f"Avg Health Score: {data.get('avg_health_score')}")
        print(f"\nARR by Bucket:")
        print(json.dumps(data.get('arr_by_bucket', {}), indent=2))
        print(f"\nRisk Breakdown:")
        print(json.dumps(data.get('risk_breakdown', {}), indent=2))
    return response.status_code == 200

def test_portfolio_insights():
    print_section("Testing Portfolio Insights (AI)")
    response = requests.post(f"{BASE_URL}/insights/portfolio")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"\nSummary: {data.get('summary')}")
        print(f"\nKey Findings:")
        for finding in data.get('key_findings', []):
            print(f"  - {finding}")
        print(f"\nTop Risks:")
        for risk in data.get('top_risks', []):
            print(f"  - {risk}")
    return response.status_code == 200

def test_account_insights():
    print_section("Testing Account Insights (AI)")
    response = requests.post(f"{BASE_URL}/insights/account/1")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"\nAccount: {data.get('account_name')}")
        print(f"Summary: {data.get('summary')}")
        print(f"\nRecommended Actions:")
        for i, action in enumerate(data.get('recommended_actions', []), 1):
            print(f"\n  {i}. {action.get('title')} [{action.get('priority')}]")
            print(f"     {action.get('description')}")
    return response.status_code == 200

def test_playbooks():
    print_section("Testing Playbooks List")
    response = requests.get(f"{BASE_URL}/playbooks")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        playbooks = response.json()
        print(f"\nTotal playbooks: {len(playbooks)}")
        for pb in playbooks[:3]:
            print(f"\n  - {pb.get('title')} [{pb.get('priority')}]")
            print(f"    Category: {pb.get('category')}")
    return response.status_code == 200

def test_playbook_recommendations():
    print_section("Testing Playbook Recommendations")
    response = requests.post(f"{BASE_URL}/actions/recommend?account_id=1")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"\nRecommendations for Account #{data.get('account_id')}:")
        for rec in data.get('recommendations', [])[:5]:
            playbook = rec.get('playbook', {})
            print(f"\n  {playbook.get('title')} (Score: {rec.get('relevance_score')})")
            print(f"  Matching risks: {', '.join(rec.get('matching_risk_factors', []))}")
    return response.status_code == 200

def main():
    print("""
    ╔════════════════════════════════════════════════════╗
    ║   AI Success Insights - API Test Suite            ║
    ╚════════════════════════════════════════════════════╝
    """)
    
    tests = [
        ("Health Check", test_health_check),
        ("CSV Upload", test_csv_upload),
        ("List Accounts", test_list_accounts),
        ("Filter Accounts", test_filter_accounts),
        ("Account Detail", test_account_detail),
        ("Health Recompute", test_health_recompute),
        ("Portfolio Summary", test_portfolio_summary),
        ("Portfolio Insights", test_portfolio_insights),
        ("Account Insights", test_account_insights),
        ("Playbooks List", test_playbooks),
        ("Playbook Recommendations", test_playbook_recommendations),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            passed = test_func()
            results.append((name, passed))
        except Exception as e:
            print(f"\n❌ Error: {e}")
            results.append((name, False))
    
    # Print summary
    print_section("Test Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\n{'='*60}")
    print(f"Results: {passed}/{total} tests passed")
    print('='*60)

if __name__ == "__main__":
    main()
