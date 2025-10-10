'use client';

import React, { useEffect, useState } from 'react';
import { AlertElement } from '@/components/elements/alert';
import { Rewards } from '@/components/statistics/rewards';
import { Summary } from '@/components/statistics/summary';
import { UserRewardData } from '@/types/quiz';

export default function Statistics() {
  const [rewardData, setRewardData] = useState<UserRewardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewardData = async (): Promise<void> => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_URL}/v1/quiz/rewards`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data = await res.json();

        if (data.status !== 'success' || !data.data) {
          throw new Error(`Failed to fetch data`);
        }

        setRewardData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRewardData();
  }, []);

  if (loading) {
    return <AlertElement title="Loading" description="Loading rewards..." />;
  }
  if (error) {
    return <AlertElement variant="destructive" title="Error" description={error} />;
  }
  if (!rewardData || rewardData.rewards.length === 0) {
    return <AlertElement description="No rewards found." />;
  }

  return (
    <div className="space-y-12">
      <Summary rewardData={rewardData} />
      <Rewards rewardData={rewardData} />
    </div>
  );
}
