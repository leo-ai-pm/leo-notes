import { renderToString } from 'react-dom/server';
import { PagesSite } from './site';

export function render() { return renderToString(<PagesSite />); }
