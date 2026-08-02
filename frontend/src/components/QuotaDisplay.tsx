import React from 'react';

export default function QuotaDisplay({ quota }: { quota: number | null }) {
  return <div>剩余额度：{quota === null ? '—' : quota + ' 字'}</div>;
}
