import React from 'react'
import AdminDashboardMetrics from './AdminDashboardMetrics'
import ProcessedDataMetrics from './ProcessedDataMetrics'

function AdminMainDashBoard() {
  return (
    <div>
    <AdminDashboardMetrics />
    <hr className="my-8" />
    <ProcessedDataMetrics />
  </div>
  )
}

export default AdminMainDashBoard