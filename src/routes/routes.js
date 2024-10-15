import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import PrivateRoute from './PrivateRoutes';
import Layout from '../components/Layout';
import ViewUsers from '../pages/Users/ViewUsers';
import UploadData from '../pages/Upload-Data/UploadData';
import UploadCampaignDataForm from '../pages/Upload-Data/UploadCampaignDataForm';
import ViewCampaign from '../pages/Campaign/ViewCampaign';
import CreateCampaign from '../pages/Campaign/CreateCampaign';
import ViewSingleCampaign from '../pages/Campaign/ViewSingleCampaign';
import UpdateCampaign from '../pages/Campaign/UpdateCampaign';
import ViewCampaignTypes from '../pages/Campaign-Types/ViewCampaignTypes';
import CreateCampaignTypes from '../pages/Campaign-Types/CreateCampaignTypes';
import SingleCampaignType from '../pages/Campaign-Types/SingleCampaignType';
import EditCampaignType from '../pages/Campaign-Types/EditCampaignType';
import ViewForms from '../pages/FormBuilder-Admin/ViewForms';
import FormBuilder from '../pages/FormBuilder-Admin/FormBuilder';
import SingleViewForm from '../pages/FormBuilder-Admin/SingleViewForm';
import EditForm from '../pages/FormBuilder-Admin/EditForm';
import AgentSearchPage from '../pages/Enter-Leads-Agents/AgentSearchPage';
import ActiveCampaigns from '../pages/Enter-Leads-Agents/ActiveCampaigns';
import AgentFormPage from '../pages/Enter-Leads-Agents/AgentFormPage';
import ViewLeads from '../pages/Leads-Admin/ViewLeads';
import ViewSingleLead from '../pages/Leads-Admin/ViewSingleLead';
import EditLeads from '../pages/Leads-Admin/EditLeads';
import AttendanceDashboard from '../pages/Attendance-Agent/AttendanceDashboard';
import ViewAttendanceLogsAdmin from '../pages/Attendance-Admin/ViewAttendanceLogsAdmin';

function App() {
  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="admin/view-users" element={<ViewUsers />} />

          <Route path="admin/view-campaign-types" element={<ViewCampaignTypes/>}/>
          <Route path="admin/create-campaign-types" element={<CreateCampaignTypes/>}/>
          <Route path="admin/single-campaign-type/:campaignTypeId" element={<SingleCampaignType/>}/>
          <Route path="admin/edit-campaign-type/:campaignTypeId" element={<EditCampaignType/>}/>

          <Route path="admin/upload-data" element={<UploadData />} />
          <Route path="admin/upload-form" element={<UploadCampaignDataForm />} />

          <Route path="admin/view-campaign" element={<ViewCampaign/>}/>
          <Route path="admin/create-campaign" element={<CreateCampaign/>}/>
          <Route path="admin/view-single-campaign/:campaignId" element={<ViewSingleCampaign/>}/>
          <Route path="admin/edit-campaign/:campaignId" element={<UpdateCampaign/>}/>

          <Route path="admin/view-forms" element={<ViewForms />} />
          <Route path="admin/create-form" element={<FormBuilder />} />
          <Route path="admin/view-single-form/:formId" element={<SingleViewForm />} />
          <Route path="admin/edit-form/:formId" element={<EditForm />} />



          <Route path="admin/leads" element={<ViewLeads />} />
          <Route path="admin/view-lead/:leadId" element={<ViewSingleLead />} />
          <Route path="admin/edit-lead/:leadId" element={<EditLeads />} />

          <Route path="admin/attendance-management" element={<ViewAttendanceLogsAdmin />} />


          <Route path="agent/attendance" element={<AttendanceDashboard />} />

          <Route path="agent/leads" element={<ActiveCampaigns />} />

          <Route path="agent/campaign/:campaignId/form/:formId" element={<AgentSearchPage/>} />

          <Route path="agent/campaign/:campaignId/form/:formId/form-entry" element={<AgentFormPage/>} />



          {/* Other protected routes */}
        </Route>

        {/* You can add more public routes here if needed */}
      </Routes>
  );
}

export default App;