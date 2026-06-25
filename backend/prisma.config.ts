import * as dotenv from 'dotenv';

dotenv.config(); 

export default {
  datasource: {
    url: process.env.DATABASE_URL, // 이제 undefined가 뜨지 않습니다!
  },
};