# Development Log

[TOC]

## @ First Sprint

### # Before get started

*프로젝트를 시작하기 전에 어떤 환경에서 어떤 구조로 빌드 할지 결정했다.*

> **Eslint** 
>
> *Airbnb standard && Ecma script* 버전을 2018 년으로 세팅했다.
>
> **Directory structure**
>
> - *Library, Service, Model, Route* 총 4가지로 나누었다.
> - Route 는 크게 `oauth` 및 `api` 로 나누었다.
>
> **Logging**
>
> Logging 을 체계적이고 논리적으로 하는것을 중요하게 생각했다. 단순히 개발할 때 콘솔에서 테스트용으로 확인하는것에 그치지 않고 추후 *production 레벨에서 서버에서 발생하는 이슈들을 파일로* 기록해야 한다고 생각 했기에 신경을 더 쓰고싶었다.

*어떤 기술스택으로 프로젝트를 구현을 할 지 미리 팀원들과 결정했다.*

> **MongoDB && Mongoose**
>
> MongoDB 는 마치 데이터들을 종이에 적어서 보관하는것 처럼 자유도가 엄청 높아서 DB schema 에 field 를 추가하거나 수정하기가 용이했다. 개발한 서비스에서 필요한 데이터들의 관계가 복잡하지 않았으며 사용자가 정말 원하는 태그가 어떤것인지에 대한 고민에 따라 태그를 조금씩 수정하기도 했었기 때문에 mongoDB 가 성격에 잘 맞았다. Compass 및 mongoose library 등 익숙한 스택이기 때문에 구현에 더 자신이 있었다.
>
> **JsonWebToken**
>
> 토큰기반 인증시스템을 제대로 구현해보고 싶은 욕심도 있었으며 모바일 어플리케이션에서 더 잘 구현될 수 있다고 생각하고 결정했다.

*어떤 middleware 및 module 을 사용할 지 미리 결정했다.*

> **Morgan**
>
> 특정 메소드의 엔드포인트에서 들어온 요청이 응답되기 까지 시간이 얼마나 소요됐으며 어떤 status code 로 응답이 되었는지 까지 친절하게 보여주는 모듈로 필수적이라고 생각했다.
>
> **Helmet**
>
> 요청이 서버로 도착을 했고 다른 미들웨어로 접근하기 전에 많은 보안적인 이슈를 해결해주고 다양한 기능을 수행하는 모듈로 없어선 안될 모듈 중 하나라고 생각했다. [링크](https://www.npmjs.com/package/helmet)

### # Configuration

*`dotenv` 모듈을 사용하여 외부에 노출되면 민감할 수 있는 정보들은 따로 관리하였다.*

> 프로젝트 루트 디렉토리에서 `.env` 파일에 민감할 수 있는 정보를 `KEY=value` 형태로 저장한 뒤 실제 코드에서는 `process.env.KEY` 라는 변수 이름으로 호출해서 사용하여 코드에 직접 정보를 노출시키지 않도록 하였다.

*`configure.js` 파일에서 여러 환경설정을 하였다.*

> Database 에 대한 세팅들 및 `log4js` 에 관한 로깅 세팅들을 모아두고 관리하였으며 필요한 부분에서 `export` 해서  사용했다.

### # Route 분리

*가장 큰 로직 2가지로 분기한 뒤 각각 기능 및 리소스에 따라서 또 여러번 분기하여 routing 하였다.*

> `api` 및 `oauth` 라우트로 분리하고 모든 리소스에 관한 요청은 `api` 로, 인증에 관한 요청은 `oauth` 로 분리하였다. 내부적으로도 각 모델별로 `cafe`, `user` 등으로 라우트 분기 하였으며 `index.js` 파일과 `controller.js` 파일을 따로 만들어 관리하였다.

### # Token 기반 인증 시스템

Refresh token 과 access token 둘 다 '잘' 사용하는 인증 시스템을 만들기 위한 고민을 많이 하였다.

*Refresh token 을 어디에 저장을 할 것인가?*

> Refresh token 으로 access token 을 발급받기 때문에 아무리 refresh token 에 유효기간이 정해져 있다고 해도 만약 탈취당할 시 그 기간동안 자유롭게 사용당할 수 있다는 우려가 있었다. Google 에서 많은 검색을 해보았지만 어디에서도 refresh token 에 대한 구체적인 구현방법이나 reference 를 찾을 수 없었다. 모두 'Somewhere safe' 에 보관하라는 말 뿐이었다. 같이 프로젝트를 진행했던 팀원이 모바일 앱에는 안전한 보관장소가 있다는 사실을 알았고 바로 *Key chain* 이었다. 그러나 key chain 에는 아이디와 비밀번호 한쌍만 저장할 수 있었기 때문에 아이디에 Refresh token 을 저장하였고 비밀번호에 사용자 아이디 및 비밀번호를 저장하는데 사용하였다.
>
> 사실 디바이스의 async storage 및 브라우저의 local storage 등도 이미 브라우저 및 OS 의 보호를 받고 있기 때문에 해당 장소에 저장해도 큰 이슈가 발생하지 않을것이다.

*Token flow 를 어떻게 구현할 것인가?*

> *Access token 을 모든 리소스요청에 담아서 보낸다. Access token 이 만료되면 refresh token 을 통해서 access token 을 재발급 받는다.* 여기까지는 확정이었으나 로그인 시 발생하는 토큰의 흐름, 사용중에 토큰문제 때문에 끊기지 않는 어플리케이션 구현 등등을 여러가지를 고민했어야 했다. 
>
> **시도 1** : 처음에는 access token 이 리소스 요청 중 만료되면 서버는 `401` 을 보내고 클라이언트는 다시 access token 재발급 요청을 보낸 뒤 발급받은 access token 으로 다시 이전 요청을 보내도록 구현을 하려고 하였다. 너무 복잡한 로직이 요구 됐으며 효율적이라고 생각되지 않아서 다시 고민하기로 했다.
>
> **시도 2** : Access token 으로 리소스에 접근할 때 마다 새로운 access token 을 발급하여 리소스에 접근하는 한 계속 만료시간을 늘리도록 하는 로직을 생각해보았다. 그래서 모든 요청에 refresh token 과 access token 을 함께 보내도록 하였다. 그러나 결국 access token 을 새로 발급받는 시점에 refresh token 이 만료되면 어플리케이션 흐름이 중간에 끊기고 refresh token 의 재발급을 위해 로그인 요청까지 보내야 하는 상황이 발생하였다.
>
> **해결책** : Where's my cup 이라는 서비스는 게임이나 영상 streaming 과 같은 긴 시간동안 사용자가 사용할 만한 서비스를 제공하지 않기 때문에 최대 이용시간이 3시간을 넘기지 않는다고 생각하였다. 때문에 access token 의 만료시간 역시 3시간으로 설정하고 사용자가 앱을 active 하는 순간마다 3시간의 만료기간을 갖는 access token 을 발급해주기로 했다. 이 때 refresh token 이 만료됐을 시 key chain 에 저장된 아이디 및 패스워드로 access 및 refresh token 을 발급 받는다. 앱이 inactive 및 background 상태에 돌입하고 돌아올 때 마다 access token 발급 요청을 매번 보내는 건 부담스러울 수 있다고 판단하여 클라이언트에서 inactive 및 background 돌입 시점을 state 로 기억하여 active 상태로 돌아올 때 마다 시간을 계산하여 1시간 이상이 지나지 않았으면 token 을 발급받지 않도록 구현을 하였다. 그렇게 access 및 refresh token 을 발급받는 모든 시점을 앱을 시작하는 시점으로 하여 사용중 끊기지 않고 요청도 복잡하게 보내지 않는 토큰기반 인증시스템을 구현할 수 있었다.

## @ Second Sprint

### # Rest API 구현

Restful 한 서버를 구현하기 위해 고민을 많이 했다. Data 의 resource 별로 route 를 나누고 또 해당 route 에서 HTTP method 별로 handler 를 나누어서 route method 를 작성했다. 생각보다 사용자의 인풋이 많이 필요한 경우가 있었고 그에따른 고민을 하게 되었다.

*특정 리소스에 접근하기 위한 정보를 어떤 형태로 받을것인가?*

> **Body 를 사용** : 사용자 작성 및 수정 정보
>
> `POST` 나 `PUT` 요청에서는 body 를 통해 작성할 데이터를 전송하기 때문에 body 에 필요한 모든 데이터를 담아서 서버로 전달하도록 구현했었다. 그러나 `GET` 혹은 `DELETE` 요청 등은 body 에 담아서 데이터를 전달 받을 수 없기 때문에 많은 양의 정보가 요구될 때 어떤 경로로 받는게 best practice 인지 고민하게 됐다. 
>
> **Param 을 사용** : 리소스의 근간이 되는 정보
>
> `GET /api/resource/:id` 와 같은 라우팅 경로를 지정하여 리소스 중에서 특정 id 를 통해 조회할 수 있도록 하였다. 사용자 위치정보도 `GET /api/resource/:lat/:lng` 와 같은 형식으로 받도록 라우트 메소드를 구현하였는데 여기서 id 와 search query 등 여러 정보도 함께 받아야 하는 상황이 발생했다. 라우팅 경로 뒤에 전부 붙여보았다. 
>
> ```javascript
> app.get('/api/resource/:id/:query/:lat/:lng');
> ```
>
> 위의 API 작성 방식이 좋지 않다고 판단했고 아래와 같은 정보를 알게됐다.
>
> **Query 를 사용** : 리소스의 sorting 및 filtering 의 기준이 되는 정보 
>
> Naver 검색 페이지 등 여러 포털사이트에서 uri 마지막에 `?query=keyword` 와 같이 되어있는 곳이 많다. 리소스를 검색해서 추려내거나 정렬, 혹은 일정 기준으로 필터링 등을 할 때 필요한 정보들을 주로 query 로 받도록 구현한다.
>
> **Header 를 사용** : 민감할 수 있는 정보
>
> Header 에는 사용자 인증에 필요한 token 이나 사용자의 현재위치에 대한 정보 등 민감할 수 있는 정보를 담아서 통신했다. 위 param 을 통해 받도록 했던 `latitude` 와 `longitute` 를 header 에 담아서 전달했다. 

### # Puppeteer

사용자들에게 서울의 모든 카페정보를 제공해야 했다. 데이터를 어떻게 수집할까 고민을 했고 그 중 하나가 데이터 크롤링이었다. Puppeteer 는 node.js 의 모듈 중 하나로 **headless chrome** 을 사용하는 강력한 툴이다. Puppeteer 를 이용해서 html tag 에 접근하여 데이터를 가져오도록 크롤러를 만들었다.

*있을수도 있고, 없을수도 있는 정보의 크롤링*

> 특정 태그를 가져오는 부분에서 자꾸 오류가 발생했다. 그래서 해당 페이지가 정적페이지가 아닌 동적페이지라는 가설을 세우고 `wait` 함수로 특정 태그가 생성 될 때 까지 기다리도록 하였다. 
>
> 그러자 이번에는 시간초과 오류가 발생하기 시작해서 확인해보니 해당 태그에 있는정보가 어떤 페이지에는 존재하고 어떤 페이지에는 그렇지 않은 경우가 있었다. 이 경우에는 `try` `catch` 문으로 예외처리를 했으며 catch 구문에 해당 url 를 로깅하여 추후에 다시 확인할 수 있도록 구현했다.

*네트워크 환경, 컴퓨터의 메모리 등 로컬 환경에서의 문제점*

> 개발하는 장소의 와이파이로 인해 네트워크 연결이 지연되어 접속이 중단되거나 몇십시간씩 컴퓨터를 켜두고 프로그램을 돌리며 동시에 개발작업을 하면서 컴퓨터에게 무리한 작업을 계속 시켜 과부화가 되어 예기치 못한 오류가 발생하는 경우가 많았다. 
>
> 물론 에러 로깅을 지속적으로 하고 중간부터 다시시작 할 수 있도록 로직을 구현하여 에러가 발생한 부분에 대한 크롤링을 다시 진행할수도 있지만 많은 부분이 끊긴다던지 아예 프로그램이 종료되면 다시 작업하기 어려운 상황이 발생했다.
>
> 로컬에서 발생하는 문제점들 때문에 aws ec2 에 네트워크 환경이 괜찮고 메모리도 나쁘지 않은 컴퓨터를 하나 열어서 크롤링을 돌리는 방법을 생각했고 ssh 통신으로 원격으로 접속하여 크롤링 작업을 한 결과 2 일 만에 56000 건 이상의 카페데이터를 128 건의 에러만 발생하며 모을 수 있었다.

### # Log4js

Log4js 모듈은 node.js 의 강력한 로깅 툴이다. 처음 사용하기로 마음 먹은 계기는 *Eslint Airbnb 표준에서 `console.log()` 함수를 지양했기 때문이다.* 처음 환경설정 및 사용법만 제대로 익혀두면 어플리케이션 흐름을 아주 잘 파악할 수 있게 해주는 훌륭한 모듈이라고 생각한다.

*예기치 못한 오류를 쉽게 파악하고 분석*

> 데이터 크롤링 과정, 클라이언트 혹은 데이터베이스와의 통신과정, JWT 확인과정이나 추천시스템 등등 서버를 백그라운드에서 지속 켜두게 되면 어디서 어떤 에러가 발생할지 모르는데 그러한 에러들이 발생한 경위나 조건들을 저장된 로깅 파일을 통해 파악하고 분석하는데 도움을 주며 버그를 고치거나 클라이언트에게 피드백을 줄 때 많이 유용하게 사용됐다.

*다양한 형태의 로그를 통해 어플리케이션 흐름을 쉽게 확인*

> Log4js 에는 `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR` 총 5개의 로깅 타입이 있다. 각 로깅 타입마다 콘솔에서 확인되는 색깔이 다르며 `getLogger` 함수의 매개변수에 따라 로거의 이름도 지정이 되어 언제 어느 로직에서 어떤 타입의 로깅이 출력되는지 확인하여 어플리케이션의 흐름을 한눈에 파악할 수 있었다.

## @ Third Sprint

### # Collaborative Filtering

Collaborative filtering 머신러닝에서 기초가 되면서 가장 많이 쓰이기도 하는 기법이다. 짧은 예시로 A 와 B 를 동시에 구매하는 사람들을 공통점으로 C 라는 물건을 산다는 결과가 나왔다면 다른 A 와 B 를 구매하는 사람에게 C 를 추천해주는 방식이다. Node.js 에서 지원하는 module 인  `ger` 를 사용하기로 하였으며 이 중에서 User based recommendation 으로 연관성 검사를 진행하였다.

*User based recommendation 으로 사용자와 가장 성향이 비슷한 사람 및 추천 아이템을 탐색*

> User based recommendation 으로 반환되는 값은 총 두가지가 있다. 첫째로는 가장 연관성이 깊고 성향이 비슷한 사람들인 *Neighbor* 들이 있으며 둘째로는 *Recommendations* 로 추천되는 아이템들이 있다. 
>
> 제작한 서비스는 태그기반 카페 추천 시스템이기에 찾은 Neighbor 들이 좋아하는 카페들을 찾아서 사용자에게 추천을 해주는 로직을 구현하였다.

*추천된 아이템과 사용자 성향을 통해 사용자와 연관성이 깊은 카페를 탐색*

> 추천이된 아이템들 중 가장 *Weight (연관성)* 가 높은 태그(아이템) 와  함께 사용자가 이미 가장 선호하는 태그로 해당 태그들과 가장 성향이 비슷하고 연관성이 비슷한 카페들을 주변 200m 범위에서 찾는다. 
>
> 그렇게 나온 카페 목록에서 이미 Neighbor 들을 통해서 추천이 된 카페와 weight 가 일정 기준이상이 아닌 카페를 제외하고 사용자에게 추천을 하는 로직을 구현하여 총 2가지 방법으로 사용자에게 추천하도록 추천시스템을 빌드하였다.

### # Mongoose

Node.js 에서 MongoDB 와 연결하여 쉽게 데이터를 읽고 쓰게 해주는 모듈이다. MongoDB 와 node.js 를 함께 사용하는 사람들은 거의 대부분 mongoose 를 사용한다고 생각하면 될 정도라고 알고있고 MongoDB 에는 존재하지 않는 schema 의 개념 등도 지원해줘서 함께 사용하기 아주 좋은 모듈이다.

*`$set` operator 의 사용법*

> Document 의 field 의 값을 변경하기 위한 용도로만 사용하였었다.
>
> ```
> User.findByIdAndUpdate( id, { $set:{ password: newPassword } } );
> ```
>
> 만약 field 가 Object 타입이고 그 field 의 property 로 값을 할당하고 싶을 때는 어떻게 해야할지 고민을 했다. 처음에는 변경하고 싶은 field 를 가지고 있는 document 를 불러와서 해당 field 의 property 를 변경하고 다시 update 하는 방식으로 했었다. 이 방법은 Database 에 2번 트래픽을 발생시켰는데 1번에 해결할 수 있는 방법이 있을것 같았다.
>
> 그래서 생각한 방법이 `$set` operator 를 사용해보는 것이었는데 아래와 같은 문법이 가능하였다.
>
> ```
> User.findByIdAndUpdate( id, { $set:{ `hasFeedbacked.${cafeId}`: timestamp } } );
> ```
>
> 이렇게 사용자가 특정 카페에 피드백을 남기면 `hasFeedbacked` 라는 object 에 property key 값으로 카페의 id, value 값으로 피드백을 남긴 시간을 세팅할 수 있었다.

*`$push` operator 의 사용법*

> 기존에는 배열타입의 field 에 push 하는 방법을 알지 못해서 항상 find 한 document 의 field 에 push 하고 update 를 시켰었다. 이렇게 2번의 Database 로의 트래픽을 1번으로 줄이고 싶어서 분명히 push 로 해결할 수 있는 방법이 있을거라는 생각에 검색을 통해서 아래와 같은 방법을 알게 되었다.
>
> ```
> User.findByIdAndUpdate( id, { $push:{ favorites: cafeId } } );
> ```

*`ObjectId` 타입 때문에 발생한 이슈*

> 사용자 요청으로 받은 Document 의 id 값과 Model 을 통해서 DB 에서 꺼낸 id 값을 비교할 일이 빈번하게 발생했다. 단순하게 `===` 연산자를 통해서 equality 가 성립하지 않는다는 이슈를 테스트 과정중에서 발견하게 되었고 사용자 input 으로 받은 모든 id 를 `ObjectId` 타입으로 전환하여 비교해보았으나 여전히 일치하지 않았다.
>
> `ObjectId` 타입 자체가 하나의 `Object` 타입이었으며 이는 reference 타입으로 같은 주소값을 가지지 않으면 내부의 모든 값이 같더라도 일치하지 않는 형식이었음을 깨닫고 Model 에서 꺼낸 모든 id 값을 `toString` 함수로 `String` 타입으로 바꾼 다음에 비교를 해서야 이슈를 해결할 수 있었다.

## @ Final Sprint

### # Apply SSL on EC2 instance

기존에는 EC2 instance 에 SSL 을 하나씩 씌우는 방법을 선택했어야 했다. 이렇게 되면 각 instance 마다 SSL 이 개별적으로 적용이 되어야 해서 만료일도 다 다르고 하나씩 관리하기도 어렵다. 인스타그램이 SSL 만료기간에 갱신을 잘 하지 못해서 접속이 안됐었던 적이 있었다. 이런 문제를 해결하기 위해 ACM(Amazon Certificate Manager) 이 나왔다. ACM 을 통해 발급받은 SSL 을 ELB 에 씌우고 ELB 에 EC2 instance 를 등록하면서 해당 ELB 에 추가된 EC2 는 모두 통합적으로 SSL 이 적용이 될 수 있게 되었다.

*ELB 및 EC2 Instance 의 Security group 적용*

> SSL 이 적용된 ELB 그룹으로 들어오는 통신은 HTTPS 프로토콜이며 ELB 가 각 instance 에게 전달하는 통신은 HTTP 프로토콜이다. 이 flow 에 맞게 ELB 의 Security group 에는 Inbound 로 HTTPS 만 허락하도록 설정한다. ELB 에 리스너를 설정해줘야 하는데 이는 ELB 가 받은 통신을 instance 로 전달하는 방법에 대한 부분이다. HTTPS 로 받은 요청을 instance 에 HTTP 요청으로 다시 전달을 해줘야 하는데 이 때 `instance port` 에는 반드시 instance 에서 inbound 로 받기로 한 포트를 입력해줘야 한다. 그렇게 아래와 같은 흐름이 완성된다.
>
> ```
> [Client]     --HTTPS-->     [ELB]     --HTTP-->     [EC2 server]
>              [443 PORT]             [Server PORT]
> ```

*구체적으로 적용하는 방법에 대해서는 다음 링크를 참조해보자 : [링크](https://github.com/Sunjae-Kim/TIL/blob/master/aws/apply-ssl-on-ec2.md)*