import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { canMarkCourseLive } from '../src/deployment-gate.ts';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('자료가 없는 디지털경영은 정직한 빈 상태와 계획 표시를 제공한다', () => {
  assert.match(page, /강의자료가 아직 등록되지 않았습니다/);
  assert.match(page, /강의 내용이 아니라/);
  assert.match(page, /자료 확인 전/);
  assert.match(page, /내용을 추측해 채우는 대신/);
});

test('공개 URL과 모든 검증이 없으면 허브에서 live로 전환하지 않는다', () => {
  assert.equal(canMarkCourseLive({ localBuildPassed: true, desktopChecked: true, mobileChecked: true }), false);
  assert.equal(canMarkCourseLive({ localBuildPassed: true, desktopChecked: true, mobileChecked: true, publicUrl: 'https://example.test/course/' }), true);
});
