import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { apiFetch } from '../api';

export default function RedeemForm({ onSuccess }: { onSuccess?: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function onRedeem() {
    if (!code) { message.warn('请输入兑换码'); return; }
    setLoading(true);
    try {
      const j = await apiFetch('/redeem', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      message.success(`兑换成功，获得 ${j.amount} 字`);
      setCode('');
      onSuccess?.();
    } catch (e: any) {
      message.error(e.message || '兑换失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
      <Input placeholder="兑换码" value={code} onChange={e=>setCode(e.target.value)} style={{ width: 240 }} />
      <Button type="default" onClick={onRedeem} loading={loading}>兑换</Button>
    </div>
  );
}
