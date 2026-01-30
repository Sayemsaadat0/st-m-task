"use client";

import { useState } from 'react';
import DashboardTable, {
  type DashboardTableColumn,
} from "@/components/shared/DashboardTable";

type DashboardDataType = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

const Dashboard = () => {
  const [isLoading] = useState(false);

  // Fake data
  const fakeData: DashboardDataType[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      status: "Active",
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "User",
      status: "Active",
      createdAt: "2024-01-20T14:45:00Z",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "Moderator",
      status: "Inactive",
      createdAt: "2024-02-01T09:15:00Z",
    },
    {
      id: 4,
      name: "Alice Williams",
      email: "alice.williams@example.com",
      role: "User",
      status: "Active",
      createdAt: "2024-02-10T16:20:00Z",
    },
    {
      id: 5,
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      role: "User",
      status: "Active",
      createdAt: "2024-02-15T11:00:00Z",
    },
  ];

  const formatDatestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const DashboardColumns: DashboardTableColumn[] = [
    {
      title: "Name",
      dataKey: "name",
      row: (data: DashboardDataType) => (
        <p className="text-black">{data?.name}</p>
      ),
    },
    {
      title: "Email",
      dataKey: "email",
      row: (data: DashboardDataType) => (
        <p className="text-black">{data?.email}</p>
      ),
    },
    {
      title: "Role",
      dataKey: "role",
      row: (data: DashboardDataType) => (
        <p className="text-black">{data?.role}</p>
      ),
    },
    {
      title: "Status",
      dataKey: "status",
      row: (data: DashboardDataType) => (
        <p className="text-black">{data?.status}</p>
      ),
    },
    {
      title: "Created At",
      dataKey: "createdAt",
      row: (data: DashboardDataType) => (
        <p className="text-black">
          {data?.createdAt ? formatDatestamp(data.createdAt) : "-"}
        </p>
      ),
    },
  ];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold text-t-black mb-4">
        Dashboard
        {fakeData.length ? ` (${fakeData.length})` : ""}
      </h1>

      <DashboardTable
        columns={DashboardColumns}
        isLoading={isLoading}
        data={fakeData}
      />
    </div>
  );
};

export default Dashboard;