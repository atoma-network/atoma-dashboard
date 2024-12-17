import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface HistogramData {
  time: string;
  usedCount: number;
  unusedCount: number;
}

interface StackHistogramProps {
  data: Stack[];
}

const aggregateData = (data: Stack[]): HistogramData[] => {
  const aggregated: { [key: string]: { used: number; unused: number } } = {};

  data.forEach((item) => {
    const time = new Date(item.created_at).toLocaleDateString();
    if (!aggregated[time]) {
      aggregated[time] = { used: 0, unused: 0 };
    }
    if (item.settled_at) {
      aggregated[time].used += 1;
    } else {
      aggregated[time].unused += 1;
    }
  });

  return Object.keys(aggregated).map((key) => ({
    time: key,
    usedCount: aggregated[key].used,
    unusedCount: aggregated[key].unused,
  }));
};

const StackHistogram: React.FC<StackHistogramProps> = ({ data }) => {
  const histogramData = aggregateData(data);

  return (
    <BarChart
      width={800}
      height={400}
      data={histogramData}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="usedCount" fill="#8884d8" name="Used Stacks" />
      <Bar dataKey="unusedCount" fill="#82ca9d" name="Unused Stacks" />
    </BarChart>
  );
};

export default StackHistogram;
