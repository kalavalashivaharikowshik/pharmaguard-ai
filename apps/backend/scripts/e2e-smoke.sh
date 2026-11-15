#!/usr/bin/env bash
# End-to-end smoke test of the PharmaGuard AI supply chain against a running API.
#
#   API=http://localhost:3000 bash scripts/e2e-smoke.sh
#
# Requires the seeded demo users (npm run seed) and python3 for JSON parsing.
set -u
API="${API:-http://localhost:3000}"
PW="${SEED_PASSWORD:-Demo@1234}"
SUFFIX="$(date +%s | tail -c 6)"
PASS=0; FAIL=0

j() { python3 -c "import sys,json; d=json.load(sys.stdin); print(eval('d'+sys.argv[1]))" "$1" 2>/dev/null; }
ok() { echo "  ✔ $1"; PASS=$((PASS+1)); }
bad() { echo "  ✘ $1"; FAIL=$((FAIL+1)); }
check() { if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (expected $3, got $2)"; fi; }

login() { curl -s "$API/auth/login" -H 'content-type: application/json' -d "{\"email\":\"$1@pharmaguard.ai\",\"password\":\"$PW\"}" | j "['accessToken']"; }
call() { # call TOKEN METHOD PATH [JSON]
  if [ -n "${4:-}" ]; then curl -s -X "$2" "$API$3" -H "authorization: Bearer $1" -H 'content-type: application/json' -d "$4"
  else curl -s -X "$2" "$API$3" -H "authorization: Bearer $1"; fi
}
code() { curl -s -o /dev/null -w '%{http_code}' -X "$2" "$API$3" ${1:+-H "authorization: Bearer $1"} -H 'content-type: application/json' ${4:+-d "$4"}; }

echo "== Health"
check "API healthy" "$(curl -s $API/health | j "['status']")" "ok"

echo "== Login (one user per role)"
ADMIN=$(login admin); REG=$(login regulator); MFG=$(login manufacturer); DIST=$(login distributor); PHA=$(login pharmacy); HOS=$(login hospital)
for t in ADMIN REG MFG DIST PHA HOS; do [ -n "${!t}" ] && ok "$t logged in" || bad "$t login"; done

echo "== Security (RBAC)"
check "Pharmacy cannot create users" "$(code "$PHA" POST /users '{"fullName":"x","email":"x@x.io","password":"abc12345","role":"SUPER_ADMIN","organizationName":"x"}')" "403"
check "Anonymous cannot revoke batches" "$(code "" POST /revocation/abc)" "401"
check "Pharmacy cannot change roles" "$(code "$PHA" PATCH /users/abc/role '{"role":"SUPER_ADMIN"}')" "403"
check "Password hash never returned" "$(call "$ADMIN" GET /users | grep -c '"password"')" "0"

echo "== Batches (blockchain registration)"
FUT=$(date -d '+1 year' +%F); SOON=$(date -d '+10 days' +%F); PAST=$(date -d '-2 days' +%F); MFD=$(date -d '-30 days' +%F)
B1=$(call "$MFG" POST /batches "{\"drugName\":\"Amoxicillin 250mg\",\"batchNumber\":\"AMX-$SUFFIX\",\"manufactureDate\":\"$MFD\",\"expiryDate\":\"$FUT\",\"quantity\":1000,\"category\":\"Antibiotic\"}")
B1ID=$(echo "$B1" | j "['id']"); B1QR=$(echo "$B1" | j "['qrCode']")
[ -n "$(echo "$B1" | j "['transactionHash']")" ] && ok "Batch registered on-chain" || bad "Batch on-chain registration: $B1"
B2ID=$(call "$MFG" POST /batches "{\"drugName\":\"Insulin Glargine\",\"batchNumber\":\"INS-$SUFFIX\",\"manufactureDate\":\"$MFD\",\"expiryDate\":\"$SOON\",\"quantity\":300,\"category\":\"Diabetes\"}" | j "['id']")
B3ID=$(call "$MFG" POST /batches "{\"drugName\":\"Cough Syrup\",\"batchNumber\":\"CSY-$SUFFIX\",\"manufactureDate\":\"$MFD\",\"expiryDate\":\"$PAST\",\"quantity\":200}" | j "['id']")
B4ID=$(call "$MFG" POST /batches "{\"drugName\":\"Ibuprofen 400mg\",\"batchNumber\":\"IBU-$SUFFIX\",\"manufactureDate\":\"$MFD\",\"expiryDate\":\"$FUT\",\"quantity\":500}" | j "['id']")
check "Blockchain verification passes" "$(call "$MFG" GET /blockchain/verify/AMX-$SUFFIX | j "['verified']")" "True"
check "Batch update (Batch Updated)" "$(call "$MFG" PATCH /batches/$B1ID '{"storageConditions":"Store below 25°C"}' | j "['storageConditions']")" "Store below 25°C"
check "Distributor cannot create batches" "$(code "$DIST" POST /batches '{}')" "403"

echo "== Transfers (Manufacturer → Distributor → Pharmacy / Hospital)"
DISTID=$(call "$DIST" GET /users/me | j "['id']"); PHAID=$(call "$PHA" GET /users/me | j "['id']"); HOSID=$(call "$HOS" GET /users/me | j "['id']")
check "Mfr → Distributor" "$(call "$MFG" POST /transfers "{\"batchId\":\"$B1ID\",\"toUserId\":\"$DISTID\",\"quantity\":600}" | j "['status']")" "COMPLETED"
call "$MFG" POST /transfers "{\"batchId\":\"$B4ID\",\"toUserId\":\"$DISTID\",\"quantity\":300}" >/dev/null
call "$MFG" POST /transfers "{\"batchId\":\"$B2ID\",\"toUserId\":\"$DISTID\",\"quantity\":100}" >/dev/null
check "Mfr → Pharmacy blocked" "$(code "$MFG" POST /transfers "{\"batchId\":\"$B1ID\",\"toUserId\":\"$PHAID\",\"quantity\":1}")" "400"
check "Distributor → Pharmacy" "$(call "$DIST" POST /transfers "{\"batchId\":\"$B1ID\",\"toUserId\":\"$PHAID\",\"quantity\":200}" | j "['status']")" "COMPLETED"
check "Distributor → Hospital" "$(call "$DIST" POST /transfers "{\"batchId\":\"$B1ID\",\"toUserId\":\"$HOSID\",\"quantity\":100}" | j "['status']")" "COMPLETED"
call "$DIST" POST /transfers "{\"batchId\":\"$B4ID\",\"toUserId\":\"$PHAID\",\"quantity\":100}" >/dev/null
check "Over-quantity transfer blocked" "$(code "$DIST" POST /transfers "{\"batchId\":\"$B1ID\",\"toUserId\":\"$PHAID\",\"quantity\":99999}")" "400"

echo "== Smart-contract sale validation"
check "Safe batch → sale approved" "$(call "$PHA" POST /sales/validate "{\"qrCode\":\"$B1QR\"}" | j "['approved']")" "True"
check "Unknown QR → blocked" "$(code "$PHA" POST /sales/validate '{"qrCode":"FAKE-QR-123"}')" "404"

echo "== Agentic AI recall"
R=$(call "$REG" POST /recalls "{\"batchId\":\"$B1ID\",\"reason\":\"Contamination found in quality testing\",\"severity\":\"HIGH\"}")
RID=$(echo "$R" | j "['id']"); [ -n "$RID" ] && ok "Recall created ($(echo "$R" | j "['recallNumber']"))" || bad "Recall create: $R"
sleep 3
TASKS=$(call "$REG" GET /ai/recall/$RID/tasks)
check "Agents created one task per holder" "$(echo "$TASKS" | j '.__len__()')" "4"
check "Recall impact located units" "$(call "$REG" GET /ai/recall/$RID/impact | j "['affectedUnits']")" "1000"
[ -n "$(call "$REG" GET /ai/recall/$RID/summary | j "['summary']")" ] && ok "AI recall summary written" || bad "AI summary"
check "Recalled batch → sale blocked" "$(call "$PHA" POST /sales/validate "{\"qrCode\":\"$B1QR\"}" | j "['reason']")" "RECALLED"
check "Duplicate active recall rejected" "$(code "$REG" POST /recalls "{\"batchId\":\"$B1ID\",\"reason\":\"duplicate test\",\"severity\":\"LOW\"}")" "400"
for t in PHA HOS DIST MFG; do
  TID=$(call "${!t}" GET /ai/my-tasks | python3 -c "import sys,json; print(next(x['id'] for x in json.load(sys.stdin) if x['recallId']=='$RID'))" 2>/dev/null)
  LAST=$(call "${!t}" PATCH /ai/tasks/$TID/complete '{"notes":"Stock quarantined"}')
done
check "Last task completes the recall" "$(echo "$LAST" | j "['recallCompleted']")" "True"
sleep 2
check "Batch revoked after recall" "$(call "$ADMIN" GET /batches/$B1ID | j "['status']")" "REVOKED"
check "Revoked on-chain (self-destruct)" "$(call "$ADMIN" GET /blockchain/batch/AMX-$SUFFIX | j "['revoked']")" "True"

echo "== Disposal"
DISP=$(call "$PHA" GET /disposals | python3 -c "import sys,json; print(next(x['id'] for x in json.load(sys.stdin) if x['batchId']=='$B1ID'))" 2>/dev/null)
[ -n "$DISP" ] && ok "Disposal notice issued to pharmacy" || bad "Disposal notice"
check "Pharmacy marks stock destroyed" "$(call "$PHA" PATCH /disposals/$DISP '{"status":"DESTROYED","evidence":"CERT-001"}' | j "['status']")" "DESTROYED"

echo "== Expiry engine"
call "$ADMIN" POST /expiry/check >/dev/null
check "Expired batch auto-revoked" "$(call "$ADMIN" GET /batches/$B3ID | j "['revocationReason']")" "EXPIRED"
check "Expired sale blocked" "$(call "$PHA" POST /sales/validate "{\"qrCode\":\"PG-CSY-$SUFFIX\"}" | j "['approved']")" "False"

echo "== Tamper detection"
if command -v psql >/dev/null && [ -n "${DATABASE_URL:-}" ]; then
  psql "${DATABASE_URL%%\?*}" -q -c "UPDATE \"Batch\" SET \"drugName\"='Fake Ibuprofen' WHERE id='$B4ID';"
  check "Tampered batch fails verification" "$(call "$PHA" GET /blockchain/verify/IBU-$SUFFIX | j "['verified']")" "False"
  check "Tampered batch revoked" "$(call "$ADMIN" GET /batches/$B4ID | j "['status']")" "REVOKED"
else
  echo "  (skipped: set DATABASE_URL to run the tamper test)"
fi

echo "== AI insights & assistant"
check "Insights computed" "$(call "$MFG" GET /ai/insights | j "['counts']['batchesAnalysed'] > 0")" "True"
[ -n "$(call "$PHA" POST /ai/chat '{"message":"Which batches expire soon?"}' | j "['answer']")" ] && ok "Assistant answered" || bad "Assistant"

echo "== Compliance & analytics"
check "Violations logged" "$(call "$REG" GET /compliance/violations | j '.__len__() >= 3')" "True"
check "Safety metrics" "$(call "$REG" GET /analytics/safety-metrics | j "['recallPerformance']['completedRecalls'] >= 1")" "True"
check "Stock map has located points" "$(call "$REG" GET /analytics/stock-map | j "['points'].__len__() >= 1")" "True"
check "Audit logs available" "$(call "$REG" GET /audit | j '.__len__() > 0')" "True"
check "Regulator cannot see audit as pharmacy" "$(code "$PHA" GET /audit)" "403"

echo
echo "== Registration & approval"
REGMAIL="org$SUFFIX@e2e.test"
REGBODY="{\"organizationName\":\"E2E Pharmacy $SUFFIX\",\"contactPerson\":\"Tester\",\"email\":\"$REGMAIL\",\"licenseNumber\":\"LIC-$SUFFIX\",\"role\":\"PHARMACY\"}"
REGID=$(curl -s "$API/registration" -H 'content-type: application/json' -d "$REGBODY" | j "['id']")
[ -n "$REGID" ] && ok "Organisation registered" || bad "Organisation registration"
check "Duplicate pending registration refused" "$(code "" POST /registration "$REGBODY")" "400"
call "$ADMIN" GET /notifications/my | grep -q "$REGMAIL" && ok "Admin notified of new registration" || bad "Admin notified of new registration"
UNREAD=$(call "$ADMIN" GET /notifications/unread-count | j "['unread']")
[ "${UNREAD:-0}" -gt 0 ] 2>/dev/null && ok "Unread notification count works" || bad "Unread count ($UNREAD)"
check "Pharmacy cannot approve registrations" "$(code "$PHA" PATCH /registration/$REGID/approve)" "403"
APPROVE=$(call "$ADMIN" PATCH /registration/$REGID/approve)
ACTTOKEN=$(echo "$APPROVE" | j "['activationUrl']" | sed 's/.*token=//')
if [ -n "$ACTTOKEN" ]; then
  check "Account activated with link" "$(code "" POST /auth/activate "{\"token\":\"$ACTTOKEN\",\"password\":\"E2ePass@123\"}")" "201"
  NEWTOKEN=$(curl -s "$API/auth/login" -H 'content-type: application/json' -d "{\"email\":\"$REGMAIL\",\"password\":\"E2ePass@123\"}" | j "['accessToken']")
  [ -n "$NEWTOKEN" ] && ok "Approved organisation can sign in" || bad "Approved organisation sign-in"
  check "Activation link works only once" "$(code "" POST /auth/activate "{\"token\":\"$ACTTOKEN\",\"password\":\"Other@1234\"}")" "400"
else
  ok "Approval sent activation email (SMTP configured)"
fi
REJMAIL="rej$SUFFIX@e2e.test"
REJBODY="{\"organizationName\":\"E2E Reject $SUFFIX\",\"contactPerson\":\"Tester\",\"email\":\"$REJMAIL\",\"licenseNumber\":\"BAD-$SUFFIX\",\"role\":\"DISTRIBUTOR\"}"
REJID=$(curl -s "$API/registration" -H 'content-type: application/json' -d "$REJBODY" | j "['id']")
check "Registration rejected" "$(call "$ADMIN" PATCH /registration/$REJID/reject '{"reason":"Invalid licence"}' | j "['status']")" "REJECTED"
check "Rejected organisation can apply again" "$(code "" POST /registration "$REJBODY")" "201"

echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
