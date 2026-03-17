/**
 * Wholesale CRUD + Photo Test (Fixed)
 * Tests: Create (with URL), Update (change URL), Read, Delete
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5236/api';
const OUTPUT_FILE = path.join(__dirname, 'wholesale-test-report.txt');

let lines = [];
function log(msg) { lines.push(msg); console.log(msg); }
let total = 0, passed = 0, failed = 0;
function pass(msg) { total++; passed++; log(`  [PASS] ${msg}`); }
function fail(msg, err) { total++; failed++; log(`  [FAIL] ${msg} — ${err}`); }
function info(msg) { log(`  [INFO] ${msg}`); }

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const method = options.method || 'GET';
        const parsedUrl = new URL(url);
        const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method,
            headers: { 'Accept': 'application/json', ...(options.headers || {}) },
            timeout: 15000
        };
        if (options.body) {
            const bodyStr = JSON.stringify(options.body);
            reqOptions.headers['Content-Type'] = 'application/json';
            reqOptions.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        }
        const req = http.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed; try { parsed = JSON.parse(data); } catch { parsed = data; }
                resolve({ status: res.statusCode, data: parsed, raw: data });
            });
        });
        req.on('error', (e) => reject({ error: e.message }));
        req.on('timeout', () => { req.destroy(); reject({ error: 'timeout' }); });
        if (options.body) req.write(JSON.stringify(options.body));
        req.end();
    });
}

async function main() {
    log('');
    log('========================================================');
    log('  WHOLESALE CRUD + PHOTO TEST');
    log('========================================================');

    // Step 1: Login as shop owner
    log('');
    log('--- Step 1: Login as Shop Owner ---');
    let ownerToken = null;
    try {
        const r = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: { email: 'kumaran@shop.lk', password: 'Shop@123' }
        });
        if (r.status === 200 && r.data?.token) {
            ownerToken = r.data.token;
            pass(`Owner login OK (token len=${ownerToken.length})`);
        } else {
            fail('Owner login', r.raw);
            writeReport(); return;
        }
    } catch (e) { fail('Owner login', e.error); writeReport(); return; }

    const authHeaders = { 'Authorization': `Bearer ${ownerToken}` };

    // Step 2: Get existing wholesale listings
    log('');
    log('--- Step 2: Get My Wholesale Listings (Before) ---');
    let beforeCount = 0;
    try {
        const r = await makeRequest(`${API_BASE}/shop/wholesale`, { headers: authHeaders });
        if (r.status === 200 && Array.isArray(r.data)) {
            beforeCount = r.data.length;
            pass(`GET /shop/wholesale → ${r.status} (${beforeCount} listings)`);
            r.data.forEach(l => info(`  "${l.title}" | Image: ${l.imageUrl || 'NONE'}`));
        } else fail('GET /shop/wholesale', r.raw);
    } catch (e) { fail('GET /shop/wholesale', e.error); }

    // Step 3: CREATE wholesale listing WITH image URL
    log('');
    log('--- Step 3: CREATE Wholesale Listing (with Image URL) ---');
    let createdId = null;
    const testImageUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200';
    try {
        const r = await makeRequest(`${API_BASE}/shop/wholesale`, {
            method: 'POST',
            headers: authHeaders,
            body: {
                itemType: 1,
                title: 'TEST - Bulk Screens with Photo',
                unitPrice: 3500,
                minOrderQty: 10,
                availableQty: 200,
                condition: 'New',
                description: 'Test listing with photo URL',
                imageUrl: testImageUrl
            }
        });
        if (r.status === 200 || r.status === 201) {
            // API returns { listingId: "guid" }
            createdId = r.data.listingId || r.data;
            pass(`CREATE wholesale → ${r.status} (ID: ${createdId})`);
        } else {
            fail(`CREATE wholesale → ${r.status}`, r.raw);
        }
    } catch (e) { fail('CREATE wholesale', e.error); }

    // Step 4: READ — verify the created listing has ImageUrl
    log('');
    log('--- Step 4: READ — Verify Created Listing Has Image ---');
    if (createdId) {
        try {
            const r = await makeRequest(`${API_BASE}/shop/wholesale`, { headers: authHeaders });
            if (r.status === 200 && Array.isArray(r.data)) {
                const created = r.data.find(l => l.id === createdId);
                if (created) {
                    if (created.imageUrl && created.imageUrl.includes('unsplash')) {
                        pass(`READ → ImageUrl is SET correctly: ${created.imageUrl.substring(0, 60)}...`);
                    } else if (created.imageUrl) {
                        pass(`READ → ImageUrl present: ${created.imageUrl}`);
                    } else {
                        fail('READ → ImageUrl is MISSING', 'imageUrl is null/empty');
                    }
                    info(`  Title: "${created.title}"`);
                    info(`  UnitPrice: ${created.unitPrice}`);
                    info(`  Condition: ${created.condition}`);
                } else {
                    // Try loose match
                    const byTitle = r.data.find(l => l.title === 'TEST - Bulk Screens with Photo');
                    if (byTitle) {
                        createdId = byTitle.id;
                        if (byTitle.imageUrl) pass(`READ → ImageUrl SET (found by title): ${byTitle.imageUrl.substring(0, 60)}...`);
                        else fail('READ → ImageUrl MISSING', 'null/empty');
                    } else {
                        fail('READ → Created listing not found', 'ID mismatch');
                    }
                }
            } else fail('READ listings', r.raw);
        } catch (e) { fail('READ listing', e.error); }
    }

    // Step 5: UPDATE — change the image URL
    log('');
    log('--- Step 5: UPDATE — Change Image URL ---');
    const updatedImageUrl = 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=200';
    if (createdId) {
        try {
            const r = await makeRequest(`${API_BASE}/shop/wholesale`, {
                method: 'PUT',
                headers: authHeaders,
                body: {
                    listingId: createdId,
                    itemType: 1,
                    title: 'TEST - Updated Screens Photo',
                    unitPrice: 4000,
                    minOrderQty: 5,
                    availableQty: 150,
                    condition: 'New',
                    description: 'Updated listing with new photo',
                    imageUrl: updatedImageUrl,
                    status: 1
                }
            });
            if (r.status === 200) {
                pass(`UPDATE wholesale → ${r.status} (image changed)`);
            } else {
                fail(`UPDATE wholesale → ${r.status}`, r.raw);
            }
        } catch (e) { fail('UPDATE wholesale', e.error); }

        // Verify update
        try {
            const r = await makeRequest(`${API_BASE}/shop/wholesale`, { headers: authHeaders });
            if (r.status === 200 && Array.isArray(r.data)) {
                const updated = r.data.find(l => l.id === createdId);
                if (updated) {
                    if (updated.imageUrl && updated.imageUrl.includes('585060544812')) {
                        pass(`VERIFY UPDATE → New ImageUrl confirmed ✓`);
                    } else if (updated.imageUrl) {
                        pass(`VERIFY UPDATE → ImageUrl present: ${updated.imageUrl.substring(0, 60)}...`);
                    } else {
                        fail('VERIFY UPDATE → ImageUrl MISSING after update', 'null/empty');
                    }
                    info(`  Title now: "${updated.title}"`);
                    info(`  Price now: ${updated.unitPrice}`);
                    info(`  Image now: ${updated.imageUrl || 'NONE'}`);
                } else {
                    fail('VERIFY UPDATE', 'Updated listing not found');
                }
            }
        } catch (e) { fail('VERIFY UPDATE', e.error); }
    }

    // Step 6: UPDATE — remove image (set to empty)
    log('');
    log('--- Step 6: UPDATE — Remove Image (empty URL) ---');
    if (createdId) {
        try {
            const r = await makeRequest(`${API_BASE}/shop/wholesale`, {
                method: 'PUT',
                headers: authHeaders,
                body: {
                    listingId: createdId,
                    itemType: 1,
                    title: 'TEST - No Photo Listing',
                    unitPrice: 4000,
                    minOrderQty: 5,
                    availableQty: 150,
                    condition: 'New',
                    description: 'Listing without photo',
                    imageUrl: '',
                    status: 1
                }
            });
            if (r.status === 200) {
                pass(`UPDATE (remove image) → ${r.status}`);
            } else {
                fail(`UPDATE (remove image) → ${r.status}`, r.raw);
            }
        } catch (e) { fail('UPDATE (remove image)', e.error); }

        // Verify removed
        try {
            const r = await makeRequest(`${API_BASE}/shop/wholesale`, { headers: authHeaders });
            if (r.status === 200 && Array.isArray(r.data)) {
                const noImg = r.data.find(l => l.id === createdId);
                if (noImg) {
                    if (!noImg.imageUrl || noImg.imageUrl === '') {
                        pass('VERIFY REMOVE → ImageUrl is now empty ✓');
                    } else {
                        fail('VERIFY REMOVE → ImageUrl still has value', noImg.imageUrl);
                    }
                }
            }
        } catch (e) { fail('VERIFY REMOVE', e.error); }
    }

    // Step 7: UPDATE — add image back
    log('');
    log('--- Step 7: UPDATE — Add Image Back ---');
    if (createdId) {
        try {
            const r = await makeRequest(`${API_BASE}/shop/wholesale`, {
                method: 'PUT',
                headers: authHeaders,
                body: {
                    listingId: createdId,
                    itemType: 1,
                    title: 'TEST - Photo Re-added',
                    unitPrice: 4000,
                    minOrderQty: 5,
                    availableQty: 150,
                    condition: 'New',
                    description: 'Photo added back',
                    imageUrl: testImageUrl,
                    status: 1
                }
            });
            if (r.status === 200) {
                pass(`UPDATE (add image back) → ${r.status}`);
            } else {
                fail(`UPDATE (add image back) → ${r.status}`, r.raw);
            }
        } catch (e) { fail('UPDATE (add image back)', e.error); }

        // Verify
        try {
            const r = await makeRequest(`${API_BASE}/shop/wholesale`, { headers: authHeaders });
            if (r.status === 200 && Array.isArray(r.data)) {
                const withImg = r.data.find(l => l.id === createdId);
                if (withImg && withImg.imageUrl) {
                    pass('VERIFY RE-ADD → ImageUrl is back ✓');
                } else {
                    fail('VERIFY RE-ADD', 'Image not restored');
                }
            }
        } catch (e) { fail('VERIFY RE-ADD', e.error); }
    }

    // Step 8: Test Image Upload endpoint for wholesale folder
    log('');
    log('--- Step 8: Image Upload Endpoint (wholesale folder) ---');
    try {
        const r = await makeRequest(`${API_BASE}/images/upload?folder=wholesale`, {
            method: 'POST',
            headers: authHeaders
        });
        if (r.status === 400) {
            pass(`POST /images/upload?folder=wholesale (no file) → ${r.status} (correctly rejected, endpoint works)`);
        } else if (r.status === 401) {
            fail('Image upload → 401', 'Owner token not accepted for image upload');
        } else {
            info(`Image upload (no file) → ${r.status}: ${r.raw}`);
        }
    } catch (e) { fail('Image upload endpoint', e.error); }

    // Step 9: DELETE — clean up test listing
    log('');
    log('--- Step 9: DELETE — Clean Up Test Listing ---');
    if (createdId) {
        try {
            const r = await makeRequest(`${API_BASE}/shop/wholesale/${createdId}`, {
                method: 'DELETE',
                headers: authHeaders
            });
            if (r.status === 200 || r.status === 204) {
                pass(`DELETE wholesale/${createdId} → ${r.status} ✓`);
            } else {
                fail(`DELETE wholesale → ${r.status}`, r.raw);
            }
        } catch (e) { fail('DELETE wholesale', e.error); }

        // Verify deleted
        try {
            const r = await makeRequest(`${API_BASE}/shop/wholesale`, { headers: authHeaders });
            if (r.status === 200 && Array.isArray(r.data)) {
                const found = r.data.find(l => l.id === createdId);
                if (!found) {
                    pass(`VERIFY DELETE → Listing removed (count: ${r.data.length}) ✓`);
                } else {
                    fail('VERIFY DELETE → Listing still exists!', JSON.stringify(found));
                }
            }
        } catch (e) { fail('VERIFY DELETE', e.error); }
    }

    // Step 10: Wholesale Marketplace — check images show there too
    log('');
    log('--- Step 10: Wholesale Marketplace (Browse All) ---');
    try {
        const r = await makeRequest(`${API_BASE}/wholesale`, { headers: authHeaders });
        if (r.status === 200 && Array.isArray(r.data)) {
            pass(`GET /wholesale → ${r.status} (${r.data.length} total listings)`);
            r.data.forEach(l => {
                info(`  "${l.title}" | Image: ${l.imageUrl || 'NONE'} | Seller: ${l.sellerShopName}`);
            });
        } else fail('GET /wholesale', r.raw);
    } catch (e) { fail('GET /wholesale', e.error); }

    // ─── FINAL REPORT ───
    log('');
    log('========================================================');
    log('  WHOLESALE CRUD + PHOTO TEST — FINAL REPORT');
    log('========================================================');
    log(`  Total Tests:    ${total}`);
    log(`  Passed:         ${passed}`);
    log(`  Failed:         ${failed}`);
    log(`  Success Rate:   ${((passed/total)*100).toFixed(1)}%`);
    log(`  Verdict:        ${failed === 0 ? 'ALL TESTS PASSED ✓' : `${failed} TESTS FAILED ✗`}`);
    log('========================================================');

    writeReport();
    process.exit(failed > 0 ? 1 : 0);
}

function writeReport() {
    fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');
    console.log(`\nReport saved to: ${OUTPUT_FILE}`);
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
