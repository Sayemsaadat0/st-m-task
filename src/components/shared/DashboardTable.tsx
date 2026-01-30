import React, { FC } from 'react';

export type DashboardTableColumn = {
  title: string;
  dataKey: string;
  row: (data: any, rowIndex: number) => React.ReactNode;
};

export type DashboardTableProps = {
  columns: DashboardTableColumn[];
  data: any[];
  isLoading: boolean;
};

const DashboardTable: FC<DashboardTableProps> = ({ columns, data, isLoading }) => {
  return (
    <div className="overflow-x-auto max-w-full border  border-t-black  overflow-hidden">
      <div className="w-full">
        <table className="w-full text-left">
          <thead className="sticky z-10 top-0 w-full h-fit bg-t-green">
            <tr className=''>
              {columns.map((column, index) => (
                <th key={index} scope="col" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-2 sm:py-3 last:text-right">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="w-full ">
            {!isLoading &&
              data &&
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  // className={`${rowIndex !== data.length - 1 ? 'border' : ''} border-t-gray/30`}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-2 sm:py-3 border border-t-gray/30 rounded-[10px] wrap-break-word last:text-right text-t-gray/70">
                      {column.row(row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        {isLoading && (
          <div className="flex justify-center items-center h-10 my-4 sm:my-6">
            <p className="text-xs sm:text-sm md:text-base text-t-gray/70">Loading...</p>
          </div>
        )}
        {!isLoading && data.length === 0 && (
          <div className="flex justify-center items-center my-4 sm:my-6">
            <p className="text-xs sm:text-sm md:text-base text-t-gray/70">No Data Available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTable;
