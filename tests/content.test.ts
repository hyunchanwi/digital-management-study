import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { canMarkCourseLive } from '../src/deployment-gate.ts';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const data = readFileSync(new URL('../src/week-data.ts', import.meta.url), 'utf8');
const source = `${page}\n${data}`;

test('자료가 없는 디지털경영은 정직한 빈 상태와 계획 표시를 제공한다', () => {
  assert.match(source, /강의자료 대기/);
  assert.match(source, /강의 내용 아님/);
  assert.match(source, /확인되지 않은 강의 내용을 임의로 만들지 않고/);
  assert.match(source, /완료 처리 불가 · 전체 진도 0\/15/);
});

test('1~15주차 탐색과 버전이 있는 마지막 위치 저장을 제공한다', () => {
  assert.match(data, /length: 15/);
  assert.match(page, /\?week=/);
  assert.match(page, /version: 1/);
  assert.match(page, /이 주차의 구성/);
});

test('공개 URL과 모든 검증이 없으면 허브에서 live로 전환하지 않는다', () => {
  assert.equal(canMarkCourseLive({ localBuildPassed: true, desktopChecked: true, mobileChecked: true }), false);
  assert.equal(canMarkCourseLive({ localBuildPassed: true, desktopChecked: true, mobileChecked: true, publicUrl: 'https://example.test/course/' }), true);
});
