import React, { useEffect, useState } from 'react';
import { Card, Select, Input, Button, message } from 'antd';
import QuotaDisplay from '../components/QuotaDisplay';
import RedeemForm from '../components/RedeemForm';
import { apiFetch } from '../api';

const { TextArea } = Input;

export default function Writer() {
  const [style, setStyle] = useState('仙侠');
  const [input, setInput] = useState('');
  const [generated, setGenerated] = useState('');
  const [quota, setQuota] = useState<number | null>(null);

  useEffect(()=>{ fetchQuota(); }, []);

  async function fetchQuota(){
    try {
      const j = await apiFetch('/user/me');
      setQuota(j.quota);
    } catch {
      setQuota(null);
    }
  }

  async function onGenerate() {
    try {
      const j = await apiFetch('/generate', {
        method: 'POST',
        body: JSON.stringify({ style, input })
      });
      setGenerated(prev => prev ? prev + '\n\n' + j.text : j.text);
      message.success(`生成成功，消耗 ${j.usedChars} 字`);
      fetchQuota();
    } catch (e: any) {
      message.error(e.message || '生成失败');
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto' }}>
      <Card title={<div style={{display:'flex', justifyContent:'space-between'}}><span>写作</span><QuotaDisplay quota={quota} /></div>}>
        <Select value={style} onChange={v=>setStyle(v)} style={{ width: 200, marginBottom: 12 }}>
          <Select.Option value="仙侠">仙侠</Select.Option>
          <Select.Option value="侦探">侦探</Select.Option>
          <Select.Option value="都市">都市</Select.Option>
          <Select.Option value="悬疑">悬疑</Select.Option>
          <Select.Option value="古风">古风</Select.Option>
        </Select>
        <TextArea rows={6} value={input} onChange={e=>setInput(e.target.value)} placeholder="粘贴你的段落..." />
        <div style={{ marginTop: 12 }}>
          <Button type="primary" onClick={onGenerate}>续写下一段</Button>
        </div>
        <Card title="生成结果" style={{ marginTop: 16 }}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{generated}</pre>
        </Card>
        <RedeemForm onSuccess={fetchQuota} />
      </Card>
    </div>
  );
}
