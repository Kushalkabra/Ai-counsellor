# Bcrypt Compatibility Fix

## Issue
- `passlib 1.7.4` is not compatible with `bcrypt 5.0.0`
- Error: `AttributeError: module 'bcrypt' has no attribute '__about__'`
- Also: bcrypt has a 72-byte password limit

## Solution
1. **Downgraded bcrypt** to version `4.0.1` which is compatible with passlib 1.7.4
2. **Added password length safeguard** in `auth.py` to handle passwords longer than 72 bytes

## Files Changed
- `backend/requirements.txt` - Pinned bcrypt to 4.0.1
- `backend/auth.py` - Added password truncation for 72-byte limit

## Verification
Password hashing and verification now work correctly without errors.
