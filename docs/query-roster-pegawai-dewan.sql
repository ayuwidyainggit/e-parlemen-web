-- Query: roster Anggota DEWAN -- satu baris per orang, dengan seluruh jabatan aktifnya
-- (bisa lebih dari satu, mis. Ketua di Fraksi + Ketua di Komisi + Anggota di Badan)
-- digabung jadi satu kolom "jabatan" (format "<posisi> - <unit>", satu per baris).
--
-- Catatan kolom "nip": orang DEWAN tidak punya employee_number_nip (NULL di skema,
-- itu kolom khusus SETWAN/PNS) -- yang dipakai sebagai identitas adalah member_code
-- (format "DPRD-AGT-0001"), konsisten dengan komentar yang sudah ada di pegawai-data.js:14
-- ("nip: employee_number_nip (Setwan) / member_code (Dewan)").
--
-- Urutan baris di kolom "jabatan" ikut org_units.sort_order (Pimpinan DPRD -> Fraksi ->
-- Komisi -> Badan/AKD), BUKAN positions.hierarchy_level -- makanya "Ketua - Pimpinan DPRD"
-- bisa muncul sebelum "Anggota - Fraksi ..." meski "Anggota" rank jabatannya lebih rendah.
--
-- Hapus filter "WHERE u.person_type = 'DEWAN'" kalau mau sertakan SETWAN juga (nip-nya
-- otomatis terisi dari employee_number_nip, kolom partai otomatis NULL).

SELECT u.name AS nama_pegawai,
       u.person_type,
       COALESCE(u.employee_number_nip, u.member_code) AS nip,
       pt.name AS partai,
       string_agg(pos.name || ' - ' || ou.name, E'\n' ORDER BY ou.sort_order) AS jabatan
FROM users u
LEFT JOIN parties pt ON pt.id = u.party_id
JOIN assignments a ON a.person_id = u.id AND a.end_date IS NULL
JOIN positions pos ON pos.id = a.position_id
JOIN org_units ou ON ou.id = a.org_unit_id
WHERE u.person_type = 'DEWAN'
GROUP BY u.id, u.name, u.person_type, u.employee_number_nip, u.member_code, pt.name
ORDER BY u.member_code;
