'use server';

import { revalidateTag } from 'next/cache';

/// 작업을 추가·수정한 뒤 목록 캐시를 즉시 비워, 새로고침 없이 반영되게 한다.
export async function revalidateProjects() {
  revalidateTag('projects');
}

/// 문구·About을 고친 뒤 관련 캐시를 함께 비운다.
export async function revalidateSiteText() {
  revalidateTag('site-text');
  revalidateTag('about');
}
