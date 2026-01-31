"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

interface EnrollmentOverTimeChartProps {
    data: Array<{
        date: string;
        enrollment_count: number;
    }>;
}

const CustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    return (
        <text
            x={x + width / 2}
            y={y - 5}
            fill="#B6F500"
            textAnchor="middle"
            fontSize={12}
            className="text-xs sm:text-sm"
            fontWeight="semibold"
        >
            {value}
        </text>
    );
};

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        return `${month} ${day}`;
    } catch {
        return dateString;
    }
};

const EnrollmentOverTimeChart: React.FC<EnrollmentOverTimeChartProps> = ({ data }) => {
    const chartData = data.map((item) => ({
        date: formatDate(item.date),
        fullDate: item.date,
        enrollment: item.enrollment_count,
    }));

    if (data.length === 0) {
        return (
            <div className="w-full bg-t-black p-4 sm:p-5 md:p-6 border border-t-green/20">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-t-gray/70 mb-3 sm:mb-4">Course Enrollments Over Time</h2>
                <div className="text-center text-xs sm:text-sm md:text-base text-t-gray/70/60 py-6 sm:py-8">
                    No enrollment data available
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-t-black p-4 sm:p-5 md:p-6 border border-t-gray/30">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-t-gray/70 mb-4 sm:mb-6">Course Enrollments Over Time</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px] md:h-[350px]">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2e2e30" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#B6F500"
                        tick={{ fill: '#ffffff', fontSize: 10 }}
                        className="text-xs sm:text-sm"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis 
                        type="number"
                        stroke="#B6F500"
                        tick={{ fill: '#ffffff', fontSize: 10 }}
                        className="text-xs sm:text-sm"
                        label={{ 
                            value: 'Enrollments', 
                            angle: -90, 
                            position: 'insideLeft',
                            fill: '#ffffff',
                            style: { textAnchor: 'middle' }
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#2e2e30',
                            border: '1px solid #B6F500',
                            borderRadius: '4px',
                            color: '#ffffff',
                        }}
                        labelStyle={{ color: '#B6F500' }}
                        formatter={(value: any, name?: string, props?: any) => [
                            `${value} enrollments`,
                            props?.payload?.fullDate || ''
                        ]}
                    />
                    <Bar 
                        dataKey="enrollment" 
                        fill="#B6F500"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    >
                        <LabelList 
                            dataKey="enrollment" 
                            content={<CustomLabel />}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EnrollmentOverTimeChart;
