import { hydrateRoot } from 'react-dom/client';
import { PagesSite } from './site';
import '../app/globals.css';

hydrateRoot(document.getElementById('root')!, <PagesSite />);
