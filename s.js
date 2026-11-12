const NOMOR_WA = "6285784275241";   // ganti dengan nomor WhatsApp toko
const ONGKIR = 15000;               // ongkir flat, isi 0 jika gratis

const produk = [
    { id: 1, nama: "Gelang Twinkle Wire", seri: "Seri Mint & Mutiara", harga: 15000, foto: "p1.jpeg" },
    { id: 2, nama: "Gelang Twinkle Wire", seri: "Seri Kupu-kupu & Bintang", harga: 20000, foto: "p2.jpeg" }
];

let keranjang = [];
try { keranjang = JSON.parse(localStorage.getItem("twinkle-keranjang")) || []; } catch (e) { keranjang = []; }

const rupiah = n => "Rp" + n.toLocaleString("id-ID");
const $ = id => document.getElementById(id);

function simpan() {
    try { localStorage.setItem("twinkle-keranjang", JSON.stringify(keranjang)); } catch (e) {}
}

function toast(pesan) {
    const t = $("toast");
    t.textContent = pesan;
    t.classList.add("tampil");
    clearTimeout(t.timer);
    t.timer = setTimeout(() => t.classList.remove("tampil"), 2200);
}

// Daftar produk
function tampilProduk() {
    $("produk-list").innerHTML = produk.map(p => `
        <div class="card">
            <img src="${p.foto}" alt="${p.nama} ${p.seri}">
            <div class="card-isi">
                <h3>${p.nama}</h3>
                <small>${p.seri}</small>
                <p class="harga">${rupiah(p.harga)}</p>
                <button class="tombol" onclick="tambah(${p.id})">Tambah ke keranjang</button>
            </div>
        </div>`).join("");
}

// Keranjang
function tambah(id) {
    const ada = keranjang.find(k => k.id === id);
    if (ada) ada.jumlah++;
    else keranjang.push({ id: id, jumlah: 1 });
    tampilkan();
    toast("Ditambahkan ke keranjang");
}

function ubah(id, selisih) {
    const item = keranjang.find(k => k.id === id);
    if (!item) return;
    item.jumlah += selisih;
    if (item.jumlah <= 0) keranjang = keranjang.filter(k => k.id !== id);
    tampilkan();
}

function kosongkan() {
    keranjang = [];
    tampilkan();
}

function hitungSubtotal() {
    return keranjang.reduce((sum, k) => sum + produk.find(p => p.id === k.id).harga * k.jumlah, 0);
}

function tampilkan() {
    const subtotal = hitungSubtotal();
    const ongkir = keranjang.length ? ONGKIR : 0;
    const jumlah = keranjang.reduce((s, k) => s + k.jumlah, 0);

    $("daftar").innerHTML = keranjang.length ? keranjang.map(k => {
        const p = produk.find(x => x.id === k.id);
        return `<li class="item">
            <div><b>${p.nama}</b><small>${p.seri} · ${rupiah(p.harga)}</small></div>
            <div class="qty">
                <button onclick="ubah(${k.id}, -1)" aria-label="Kurangi">−</button>
                <span>${k.jumlah}</span>
                <button onclick="ubah(${k.id}, 1)" aria-label="Tambah">+</button>
            </div>
        </li>`;
    }).join("") : '<li class="kosong">Keranjang masih kosong. Pilih gelang di atas.</li>';

    $("subtotal").textContent = rupiah(subtotal);
    $("ongkir").textContent = rupiah(ongkir);
    $("total").textContent = rupiah(subtotal + ongkir);
    $("badge").textContent = jumlah;
    simpan();
}

// Checkout
function checkout() {
    if (!keranjang.length) return toast("Keranjang masih kosong");

    const wajib = ["nama", "hp", "alamat"];
    wajib.forEach(id => $(id).classList.toggle("error", !$(id).value.trim()));
    if (wajib.some(id => !$(id).value.trim())) return toast("Lengkapi nama, nomor WhatsApp, dan alamat");

    let pesan = "*PESANAN TWINKLE STORE*\n\n";
    pesan += "Nama: " + $("nama").value.trim() + "\n";
    pesan += "WhatsApp: " + $("hp").value.trim() + "\n";
    pesan += "Alamat: " + $("alamat").value.trim() + "\n";
    pesan += "Pembayaran: " + $("pembayaran").value + "\n";
    if ($("catatan").value.trim()) pesan += "Catatan: " + $("catatan").value.trim() + "\n";

    pesan += "\n*Daftar Produk:*\n";
    keranjang.forEach(k => {
        const p = produk.find(x => x.id === k.id);
        pesan += "- " + p.nama + " (" + p.seri + ") x" + k.jumlah + " = " + rupiah(p.harga * k.jumlah) + "\n";
    });
    pesan += "\nOngkir: " + rupiah(ONGKIR);
    pesan += "\n*Total: " + rupiah(hitungSubtotal() + ONGKIR) + "*";

    window.open("https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(pesan), "_blank");
}

// Tema terang / gelap
function setTema(tema) {
    document.documentElement.dataset.tema = tema;
    $("tema").textContent = tema == "dark" ? "☀" : "☾";
    try { localStorage.setItem("twinkle-tema", tema); } catch (e) {}
}

function gantiTema() {
    setTema(document.documentElement.dataset.tema == "dark" ? "light" : "dark");
}

let temaAwal = null;
try { temaAwal = localStorage.getItem("twinkle-tema"); } catch (e) {}
if (!temaAwal) temaAwal = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

setTema(temaAwal);
tampilProduk();
tampilkan();
