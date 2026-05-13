import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import FormPage from './pages/FormPage';
import GalleryPage from './pages/GalleryPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<FormPage />} />
          <Route path="gallery" element={<GalleryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
