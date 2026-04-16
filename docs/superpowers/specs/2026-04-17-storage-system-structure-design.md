# Storage System 문서 구조 재설계

작성일: 2026-04-17

## 배경

현재 `docs/entity/data/storage-system/` 아래에는 다음 성격의 문서가 같은 레벨에 섞여 있습니다.

- 제품 또는 시스템 개요 문서
- 특정 시스템의 기능 문서
- 특정 시스템의 운영 문서
- 특정 시스템의 배포 문서

Ceph 관련 문서가 대표적입니다. 예를 들어 `ceph`, `rook-ceph`, `cephfs`, `rbd`, `osd`, `pg`, `reboot`가 모두 루트 바로 아래에 있어, 다른 스토리지 시스템이 추가되면 분류 기준이 무너지기 쉽습니다.

사용자 우선순위는 링크 안정성보다 구조 정리입니다.

## 목표

- `storage-system` 아래 정보구조를 장기적으로 확장 가능한 형태로 정리한다.
- 특정 시스템 전용 문서는 해당 시스템 디렉터리 안으로 모은다.
- 새 스토리지 시스템이 추가되더라도 같은 규칙으로 문서를 배치할 수 있게 한다.
- Docusaurus의 자동 생성 사이드바에서 구조가 자연스럽게 드러나게 한다.

## 비목표

- 이번 설계 단계에서 전체 저장소의 다른 도메인 구조까지 함께 개편하지 않는다.
- 문서 본문 내용 품질 개선, 대규모 내용 병합, 한국어 표현 수정은 우선순위에서 제외한다.

## 고려한 접근 방식

### 1. 현 구조 유지

장점:

- 즉시 변경 비용이 없다.

단점:

- Ceph 전용 하위 문서가 루트에 퍼져 있어 다른 시스템과 같은 레벨이 된다.
- 문서 수가 늘수록 분류 기준이 불명확해진다.
- 자동 생성 사이드바에서 제품, 기능, 운영 작업이 섞여 보인다.

### 2. 시스템 중심 구조

예시:

```text
storage-system/
  ceph/
  mongodb/
  local-path-provisioner/
  s3/
```

각 시스템 아래에 개요, 설치, 기능, 운영 문서를 둔다.

장점:

- 확장성이 가장 좋다.
- 특정 시스템 문서를 한곳에서 찾기 쉽다.
- 자동 생성 사이드바와도 잘 맞는다.

단점:

- 기존 링크와 경로를 한 번 정리해야 한다.

### 3. 작업 유형 중심 구조

예시:

```text
storage-system/
  overview/
  installation/
  operations/
```

장점:

- 같은 종류의 작업 문서를 비교해 보기 쉽다.

단점:

- 특정 시스템의 전체 문서를 한 번에 탐색하기 어렵다.
- 문서 수가 늘면 오히려 추적 비용이 커진다.

## 결정

`storage-system` 아래는 시스템 중심 구조로 재편한다.

루트 바로 아래에는 시스템 이름 또는 공통 개념만 둔다. 특정 시스템에만 의미가 있는 문서는 반드시 해당 시스템 디렉터리 안으로 이동한다.

## 제안 구조

```text
docs/entity/data/storage-system/
  basics/
    basics.mdx
  ceph/
    overview.mdx
    rook.mdx
    cluster.mdx
    central-storage-cluster.mdx
    cephfs.mdx
    rbd.mdx
    object-gateway.mdx
    provisioning.mdx
    operations/
      monitoring.mdx
      osd.mdx
      pg.mdx
      reboot.mdx
      tuning.mdx
  local-path-provisioner/
    overview.mdx
  mongodb/
    overview.mdx
  s3/
    basics.mdx
```

## 구조 규칙

1. `storage-system` 루트 바로 아래에는 시스템 이름 또는 진짜 공통 개념만 둔다.
2. 특정 시스템에서만 쓰이는 기능 문서는 반드시 그 시스템 하위로 둔다.
3. 운영 절차성 문서는 가능하면 `operations/` 아래에 둔다.
4. `overview.mdx`는 해당 시스템의 진입 문서로 사용한다.
5. 설치 문서가 별도 필요하면 `installation.mdx`를 사용하되, 실제로 내용이 분리될 때만 만든다.
6. 제품명이 문서 이름에 이미 포함되어 있더라도 경로 기준으로 의미가 드러나면 파일명은 짧게 유지한다.

## Ceph 문서 이동 매핑

| 현재 경로 | 새 경로 |
| --- | --- |
| `docs/entity/data/storage-system/ceph/ceph.mdx` | `docs/entity/data/storage-system/ceph/overview.mdx` |
| `docs/entity/data/storage-system/rook-ceph/rook-ceph.mdx` | `docs/entity/data/storage-system/ceph/rook.mdx` |
| `docs/entity/data/storage-system/cluster/cluster.mdx` | `docs/entity/data/storage-system/ceph/cluster.mdx` |
| `docs/entity/data/storage-system/central-storage-cluster/central-storage-cluster.mdx` | `docs/entity/data/storage-system/ceph/central-storage-cluster.mdx` |
| `docs/entity/data/storage-system/cephfs/cephfs.mdx` | `docs/entity/data/storage-system/ceph/cephfs.mdx` |
| `docs/entity/data/storage-system/rbd/rbd.mdx` | `docs/entity/data/storage-system/ceph/rbd.mdx` |
| `docs/entity/data/storage-system/object-gateway/object-gateway.mdx` | `docs/entity/data/storage-system/ceph/object-gateway.mdx` |
| `docs/entity/data/storage-system/provisioning/provisioning.mdx` | `docs/entity/data/storage-system/ceph/provisioning.mdx` |
| `docs/entity/data/storage-system/monitoring/monitoring.mdx` | `docs/entity/data/storage-system/ceph/operations/monitoring.mdx` |
| `docs/entity/data/storage-system/osd/osd.mdx` | `docs/entity/data/storage-system/ceph/operations/osd.mdx` |
| `docs/entity/data/storage-system/pg/pg.mdx` | `docs/entity/data/storage-system/ceph/operations/pg.mdx` |
| `docs/entity/data/storage-system/reboot/reboot.mdx` | `docs/entity/data/storage-system/ceph/operations/reboot.mdx` |
| `docs/entity/data/storage-system/tuning/tuning.mdx` | `docs/entity/data/storage-system/ceph/operations/tuning.mdx` |

## 비-Ceph 문서 처리 원칙

- `local-path-provisioner`는 독립 시스템으로 유지한다.
- `mongodb`는 엄밀히 말하면 데이터베이스 제품이지만 현재 위치를 즉시 바꾸지 않고, 이번 작업에서는 `storage-system` 내부 구조 정리 대상에서 제외하거나 별도 후속 작업으로 분리한다.
- `basics/basics.mdx`가 S3 일반 개념 문서라면 장기적으로는 `s3/basics.mdx`로 옮기는 편이 더 일관된다.

## 링크와 식별자 처리

문서 이동 시 다음을 함께 수정한다.

- 문서 간 상대 링크 또는 `/docs/...` 링크
- 같은 문서 내부에서 다른 문서를 참조하는 Reference block
- 필요한 경우 `id`와 파일명을 새 규칙에 맞게 조정

원칙:

- Docusaurus의 문서 ID를 경로 기반으로 이해하기 쉽게 맞춘다.
- 파일명 기반 `id` 규칙을 유지해야 하므로, 파일 이동 후 frontmatter의 `id`도 새 파일명과 일치시킨다.

## 사이드바 영향

현재 `sidebars.ts`는 `entity`를 자동 생성 방식으로 노출합니다. 따라서 디렉터리 구조 변경은 사이드바와 시각화 컴포넌트에 직접 반영됩니다.

기대 효과:

- `storage-system` 아래에서 Ceph 문서가 하나의 묶음으로 보인다.
- 운영 문서가 `operations` 아래에 모여 정보 탐색 비용이 줄어든다.
- 새 시스템을 추가해도 구조가 자연스럽게 확장된다.

주의점:

- 자동 생성 사이드바의 정렬과 라벨 노출이 달라질 수 있다.
- 필요하면 `sidebar_label`을 조정해 탐색성을 보완한다.

## 마이그레이션 순서

1. 새 디렉터리 구조 생성
2. Ceph 문서 파일 이동 및 파일명 정리
3. 각 문서 frontmatter의 `id` 수정
4. 저장소 전체의 `/docs/...` 링크와 참조 링크 수정
5. Docusaurus 빌드 또는 링크 검증 실행
6. 남은 비-Ceph 문서의 후속 정리 범위 결정

## 검증 계획

- `rg '/docs/entity/data/storage-system/' docs`로 이전 경로 참조를 점검한다.
- Docusaurus 빌드로 깨진 링크와 문서 해상도 오류를 확인한다.
- 자동 생성 사이드바에서 `storage-system` 트리를 육안 확인한다.

## 리스크

- 문서 이동량이 많아 링크 누락이 생길 수 있다.
- `id` 변경이 기존 inbound link를 깨뜨릴 수 있다.
- `mongodb`, `basics` 같은 예외 항목을 어떻게 다룰지 후속 정리가 필요하다.

## 후속 결정 필요 항목

1. 이번 작업 범위를 Ceph 문서 재배치만으로 제한할지
2. `mongodb`를 `storage-system`에서 분리할지 유지할지
3. `basics`를 공통 문서로 유지할지 `s3` 하위로 이동할지
