import test from 'node:test';
import assert from 'node:assert/strict';
import {mergePublished} from './import-wechat.mjs';
const one={id:'J0BMxUEtUeHUQix-LyCZyg',title:'Old',excerpt:'Keep summary',category:'项目实践',date:'2026-09-06',wechatUrl:'https://mp.weixin.qq.com/s/J0BMxUEtUeHUQix-LyCZyg'};
const newer={id:'wGan3YjOAuwAYyiv8p0muA',title:'New',date:'2026-10-06',publishedAt:1791218293,wechatUrl:'https://mp.weixin.qq.com/s/wGan3YjOAuwAYyiv8p0muA',visibility:'public',excerpt:'Original digest'};
const input=records=>({version:1,account:'Leo-AIpm',complete:true,records});
const old={...one,publishedAt:1788705064,visibility:'public'};
const current={version:1,account:'Leo-AIpm',articles:[one]};
test('new public article appears first; old IDs and curated summary survive',()=>{
 const next=mergePublished(current,input([old,newer]));assert.equal(next.articles.length,2);assert.equal(next.articles[0].id,newer.id);assert.equal(next.articles[1].excerpt,one.excerpt);
 assert.deepEqual(mergePublished(next,input([old,newer])),next);
});
test('private items never become public and withdrawn items disappear',()=>{
 const next=mergePublished(current,input([newer,{...old,visibility:'private'}]));assert.deepEqual(next.articles.map(a=>a.id),[newer.id]);
});
test('missing login, wrong account, partial data and invalid metadata fail closed',()=>{
 for(const bad of [{}, {...input([old]),account:'Other'}, {...input([old]),complete:false},input([]),input([old,old]),input([{...newer,wechatUrl:'https://evil.example/'}]),input([{...newer,date:'2026-10-05'}])])assert.throws(()=>mergePublished(current,bad));
 assert.equal(current.articles.length,1);
});
