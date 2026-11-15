#!/usr/bin/env bash
# Loads realistic demo activity into a running PharmaGuard AI API
# (batches on the blockchain, transfers down the supply chain and an active AI recall).
#
#   API=https://pharmaguard-api.onrender.com bash scripts/demo-data.sh
#
# Needs the demo users (SEED_DEMO_DATA=true or `npm run seed`). Safe to run once;
# running again creates a second set of batches with new numbers.
set -eu
API="${API:-http://localhost:3000}"
PW="${SEED_PASSWORD:-Demo@1234}"
S="$(date +%m%d%H%M)"
j() { python3 -c "import sys,json; print(json.load(sys.stdin)$1)"; }
login() { curl -s "$API/auth/login" -H 'content-type: application/json' -d "{\"email\":\"$1@pharmaguard.ai\",\"password\":\"$PW\"}" | j "['accessToken']"; }
post() { curl -s -X POST "$API$2" -H "authorization: Bearer $1" -H 'content-type: application/json' -d "$3"; }
get() { curl -s "$API$2" -H "authorization: Bearer $1"; }

echo "Logging in…"
MFG=$(login manufacturer); DIST=$(login distributor); REG=$(login regulator)
DISTID=$(get "$DIST" /users/me | j "['id']")
PHAID=$(curl -s "$API/auth/login" -H 'content-type: application/json' -d "{\"email\":\"pharmacy@pharmaguard.ai\",\"password\":\"$PW\"}" | j "['user']['id']")
HOSID=$(curl -s "$API/auth/login" -H 'content-type: application/json' -d "{\"email\":\"hospital@pharmaguard.ai\",\"password\":\"$PW\"}" | j "['user']['id']")

d() { date -d "$1" +%F; }
batch() { # name number expiry qty category
  post "$MFG" /batches "{\"drugName\":\"$1\",\"batchNumber\":\"$2-$S\",\"manufactureDate\":\"$(d '-60 days')\",\"expiryDate\":\"$3\",\"quantity\":$4,\"category\":\"$5\"}" | j "['id']"
}

echo "Creating batches (each is registered on the blockchain, this can take a few seconds)…"
B1=$(batch "Paracetamol 500mg" PCM "$(d '+18 months')" 5000 "Analgesic")
B2=$(batch "Amoxicillin 250mg" AMX "$(d '+12 months')" 3000 "Antibiotic")
B3=$(batch "Insulin Glargine" INS "$(d '+20 days')" 800 "Diabetes")
B4=$(batch "Metformin 500mg" MET "$(d '+9 months')" 4000 "Diabetes")
B5=$(batch "Azithromycin 500mg" AZI "$(d '+14 months')" 2500 "Antibiotic")

echo "Moving stock down the supply chain…"
for b in "$B1:2500" "$B2:1500" "$B3:500" "$B4:2000" "$B5:1200"; do
  post "$MFG" /transfers "{\"batchId\":\"${b%%:*}\",\"toUserId\":\"$DISTID\",\"quantity\":${b##*:}}" >/dev/null
done
for b in "$B1:$PHAID:800" "$B1:$HOSID:600" "$B2:$PHAID:500" "$B3:$HOSID:300" "$B4:$PHAID:900" "$B5:$HOSID:400"; do
  IFS=: read -r bid uid q <<<"$b"
  post "$DIST" /transfers "{\"batchId\":\"$bid\",\"toUserId\":\"$uid\",\"quantity\":$q}" >/dev/null
done

echo "Starting an AI recall (agents create tasks and notify every holder)…"
post "$REG" /recalls "{\"batchId\":\"$B5\",\"reason\":\"Dissolution test failure reported by the state drug laboratory\",\"severity\":\"HIGH\"}" | j "['recallNumber']"

echo "Done. Log in to the web app with any demo account (password $PW)."
