import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import FormPage from './pages/FormPage';
import GalleryPage from './pages/GalleryPage';
import './index.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<FormPage />} />
          <Route path="gallery" element={<GalleryPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
