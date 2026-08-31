export type Week = {
  number: number;
  title: string;
  description: string;
  topics: string[];
  available: false;
};

export const weeks: Week[] = Array.from({ length: 15 }, (_, index) => ({
  number: index + 1,
  title: `${index + 1}주차`,
  description: '강의자료 대기',
  topics: ['자료 대기', '내용 미생성'],
  available: false,
}));

export type GuideSectionId = 'status' | 'process' | 'ready';

export const guideSections: {
  id: GuideSectionId;
  label: string;
  title: string;
  lead: string;
  points: { title: string; body: string }[];
}[] = [
  {
    id: 'status',
    label: '현재 상태',
    title: '강의자료가 도착하면 학습 노트가 열립니다',
    lead: '현재 등록된 강의파일이나 녹음 정리가 없어 강의 내용을 임의로 만들지 않았습니다. 이 영역은 강의 내용이 아닌 학습실 안내입니다.',
    points: [
      { title: '공개 범위', body: '강의자료에서 확인된 설명과 학습자가 정리한 내용만 사이트에 반영합니다.' },
      { title: '진도 기준', body: '자료가 없는 주차는 완료할 수 없으며 전체 진도는 0/15로 유지됩니다.' },
    ],
  },
  {
    id: 'process',
    label: '자료 반영 절차',
    title: '파일 확인부터 복습 문제까지 한 흐름으로 정리합니다',
    lead: '강의자료와 녹음 정리가 추가되면 출처와 범위를 확인한 뒤 쉬운 설명, 핵심 흐름, 비교 정리와 확인 문제 순서로 구성합니다.',
    points: [
      { title: '1. 자료 확인', body: '과목·주차·페이지 범위를 확인하고 강의자료와 녹음 내용을 서로 대조합니다.' },
      { title: '2. 학습 구조화', body: '핵심 개념을 쉬운 설명, 흐름, 비교표와 기억 카드로 재구성합니다.' },
      { title: '3. 검수 후 반영', body: '불확실한 내용과 개인 경로를 제거하고 모바일 화면과 기능을 확인합니다.' },
    ],
  },
  {
    id: 'ready',
    label: '준비 방법',
    title: '강의파일이나 학습 정리를 전달하면 됩니다',
    lead: 'PDF·PPT·녹음·필기 중 한 가지라도 있으면 해당 주차부터 채울 수 있습니다. 자료가 들어오기 전에는 안내와 실제 강의 내용을 명확히 분리합니다.',
    points: [
      { title: '가능한 자료', body: '강의 슬라이드, 녹음 파일, 녹음 요약, 수업 필기와 질문 내용을 사용할 수 있습니다.' },
      { title: '표시 원칙', body: '강의 근거가 없는 보충 설명은 강의 내용으로 표시하지 않습니다.' },
    ],
  },
];
