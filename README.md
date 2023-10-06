<h1>🍖 Food Share | 음식에 대한 정보 Food Share에서!</h1>

<h4><a href="https://www.foodshare.shop" target="_blank"><s>사이트 바로가기</s></a>&nbsp;&nbsp;&nbsp;<a href="https://github.com/dev-nohyj/cooking-recipe-fe" target="_blank">프론트엔드 Repository</a>&nbsp;&nbsp;&nbsp;<a href="https://github.com/dev-nohyj/cooking-recipe-be" target="_blank">백엔드 Repository</a></h4>

<br/>
<br/>

<img src="https://github.com/dev-nohyj/cooking-recipe-be/assets/141613226/d5cd6412-2f84-481f-85ef-bfc16672889a" alt="img"  width="100%" height="auto">

## 💬 프로젝트 소개

**음식 사진 및 나만의 레시피를 공유하는 사이트**

-   개인 프로젝트
-   개발기간: 2023.08.09 ~ 2023.08.29
-   최근 유튜브 쇼츠 등 음식과 관련된 영상을 자주 접하게 되어 흥미를 갖고 있었으며, 음식을 주제로 한 프로젝트를 진행하면 어떨까 생각해서 진행하게 됨

    <br/>
    <br/>

## ⚒️ Package

-   Language: TypeScript
-   Stack: Nestjs, Express
-   ORM: Prisma
-   Validation: class-validator
-   Logging: winston

    <br/>
    <br/>

## ⚙️ 배포 및 인프라

-   배포: AWS EC2에 배포를 진행했으며, 웹서버로 nginx에서 로드벨런싱 처리를 진행함, 3개의 포트에 서버를 구동시켰으며 2개의 포트는 연결이 적은 순으로 유입 처리, 1개의 포트는 백업서버로 구동함. 또한 pm2를 사용하여 무중단 배포 방식을 적용. 스케쥴 서버 또한 해당 EC2 인스턴트에서 구동함
-   이미지: AWS S3에서 파일을 관리했으며, presigned url 방식을 사용
-   DB: mysql을 사용했으며, AWS RDS에서 관리함
-   Inmemory DB: redis를 사용하였으며, AWS elastiCache에서 관리함

<br/>
<br/>

## API DOCS

-   swagger를 사용하여 관리하고 있으며, 개발 환경에서만 열람이 가능하게 처리
<details>
<summary>API 요약 이미지</summary>
<div markdown="1">

<img src="https://github.com/dev-nohyj/cooking-recipe-be/assets/141613226/1e748e4f-4ef3-4d87-9cfa-e571a6319bc7" alt="img"  width="100%" height="auto">

</div>
</details>
    
    
<br/>
<br/>

## 💡 사용 및 환경 변수

<br />

```bash
$ git clone https://github.com/dev-nohyj/cooking-recipe-be.git
$ cd cooking-recipe-be
$ yarn
$ yarn start:dev
```

<br />

```bash
prisma 셋팅
$ cd src/prisma
$ npx prisma generate
$ npx prisma db push
```

<br/>

```bash
.env File
DATABASE_URL="database url"
TZ=timezone
PORT="dev는 8000번 사용함"

SWAGGER_URL="swagger api docs url"
SWAGGER_ID="swagger id"
SWAGGER_PWD="swagger pwd"
CORS_URL="cors url"
CLIENT_URL="프론트 url"

COOKIE_SECRET="쿠키 시크릿"
SESSION_SECRET="세션 시크릿"
SESSION_KEY="세션 키값"
SESSION_DOMAIN="세션 도메인"

REDIS_URL="redis url"
REDIS_PORT="redis port"
REDIS_HOST="redis host"

KAKAO_ID="kakao dev id"
KAKAO_CALLBACK_URL="kakao callback login url /auth/kakao/callback"

GOOGLE_CLIENT_ID="google cloud id"
GOOGLE_CLIENT_SECRET="google cloud secret"
GOOGLE_CALLBACK_URL="google callback login url /auth/google/callback"

AWS_S3_BUCKET_NAME="s3 bucket name"
AWS_S3_ACCESS_KEY_ID="s3 bucket key"
AWS_S3_SECRET_ACCESS_KEY="s3 access key"
AWS_REGION="리젼"
```

<br />
<br />

## 🚀 트러블 슈팅 및 개선

<br />

-   게시물의 조회수를 redis에서 관리 후 조회수 갱신을 스케쥴러로 처리하는 방식을 구현했는데 새로 고침을 무한히 반복하면 계속해서 조회수가 늘어나는 현상이 발생했습니다. 세션 내 유저의 id를 기준으로 스케쥴러 interval 시간을 1분 제한을 걸어 중복을 제한하려 했으나 비회원의 경우 해당 문제를 해결하기가 어려울 것 같아 ip기준으로 변경해서 제한을 했으며, 해당 이슈를 개선했습니다.
