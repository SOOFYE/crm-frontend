import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import PrivateRoute from './PrivateRoutes';
import Layout from '../components/Layout';
import ViewUsers from '../pages/Users/ViewUsers';
import UploadData from '../pages/Upload-Data/UploadData';
import UploadForm from '../pages/Upload-Data/UploadForm';
import ViewCampaign from '../pages/Campaign/ViewCampaign';
import CreateCampaign from '../pages/Campaign/CreateCampaign';
import ViewSingleCampaign from '../pages/Campaign/ViewSingleCampaign';
import UpdateCampaign from '../pages/Campaign/UpdateCampaign';

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
          <Route path="admin/upload-data" element={<UploadData />} />
          <Route path="admin/upload-form" element={<UploadForm />} />
          <Route path="admin/view-campaign" element={<ViewCampaign/>}/>
          <Route path="admin/create-campaign" element={<CreateCampaign/>}/>
          <Route path="admin/view-single-campaign/:campaignId" element={<ViewSingleCampaign/>}/>
          <Route path="admin/edit-campaign/:campaignId" element={<UpdateCampaign/>}/>
          {/* Other protected routes */}
        </Route>

        {/* You can add more public routes here if needed */}
      </Routes>
  );
}

export default App;