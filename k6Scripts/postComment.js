import http from 'k6/http';
import { url } from './config.js';
import { check } from 'k6';
import { parseHTML } from 'k6/html';

export default function () {
    const login_res = http.post(url('/login'), {
        'account_name': 'kitada',
        'password': 'password',
    });

    check(login_res, {
        'login status is 200': (r) => r.status === 200,
    });

    const res = http.get(url('/@kitada'));

    check(res, {
        'get comment page status is 200': (r) => r.status === 200,
    });

    const doc = parseHTML(res.body);

    const csrf_token = doc.find('input[name="csrf_token"]').first().attr("value");
    const post_id = doc.find('input[name="post_id"]').first().attr("value");

    const comment_res = http.post(url('/comment'), {
        "comment": "Hello !",
        "post_id": post_id,
        "csrf_token": csrf_token,
    });

    check(comment_res, {
        'post comment status is 200': (r) => r.status === 200,
    });
}
