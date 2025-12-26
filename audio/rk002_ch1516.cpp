bool RK002_onChannelMessage(byte sts, byte d1, byte d2) {
  byte type = sts & 0xF0;
  byte channel = sts & 0x0F;

  // If channel = 15 (1-based), rewrite to 16
  if (channel == 14) {
    RK002_sendChannelMessage(type | 0x0F, d1, d2);
    return false; // block original
  }

  // Otherwise, let original message pass unchanged
  return true;
}
