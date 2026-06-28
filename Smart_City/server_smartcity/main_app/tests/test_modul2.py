"""
Lab Session 15 - Automated Testing
Unit Test: PrivacyDataTests

Skenario:
- PRIV01: Feed publik menampilkan "Warga Anonim" sebagai pelapor
- PRIV02: my_reports menampilkan nama asli pemilik
- PRIV03: Warga A tidak bisa GET detail draf milik Warga B -> 404
- PRIV04: Warga A tidak bisa PUT draf milik Warga B -> 404, data tidak berubah
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from main_app.models import Report

User = get_user_model()


def get_jwt_token(user):
    """Helper: ambil access token JWT untuk user tertentu."""
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


class PrivacyDataTests(TestCase):

    def setUp(self):
        """
        Arrange: Buat dua warga (A dan B) dan laporan milik Warga B.
        """
        self.client_a = APIClient()
        self.client_b = APIClient()

        # Buat Warga A
        self.warga_a = User.objects.create_user(
            username='warga_a',
            password='password123'
        )

        # Buat Warga B
        self.warga_b = User.objects.create_user(
            username='warga_b',
            password='password123'
        )

        # Set JWT token masing-masing
        self.client_a.credentials(
            HTTP_AUTHORIZATION='Bearer ' + get_jwt_token(self.warga_a)
        )
        self.client_b.credentials(
            HTTP_AUTHORIZATION='Bearer ' + get_jwt_token(self.warga_b)
        )

        # Buat laporan REPORTED milik Warga B (tampil di feed)
        self.laporan_reported_b = Report.objects.create(
            title='Laporan B - Reported',
            category='Jalan',
            description='Jalan berlubang',
            location='Jl. Merdeka',
            reporter=self.warga_b,
            status='REPORTED'
        )

        # Buat laporan DRAFT milik Warga B (tidak tampil di feed Warga A)
        self.laporan_draft_b = Report.objects.create(
            title='Draft Rahasia B',
            category='Sampah',
            description='Isi draf rahasia',
            location='Jl. Sudirman',
            reporter=self.warga_b,
            status='DRAFT'
        )

    def test_PRIV01_feed_publik_anonimkan_pelapor(self):
        """
        PRIV01: Warga A akses feed publik -> pelapor disamarkan jadi "Warga Anonim".
        """
        # Act
        response = self.client_a.get('/api/report/?tab=feed')

        # Assert
        self.assertEqual(response.status_code, 200)
        data = response.json()
        results = data.get('results', data)
        if isinstance(results, list) and len(results) > 0:
            for item in results:
                self.assertEqual(item['reporter'], 'Warga Anonim')

    def test_PRIV02_my_reports_tampil_nama_asli(self):
        """
        PRIV02: Warga A akses my_reports -> identitas pelapor menampilkan nama asli warga_a.
        """
        # Arrange: buat laporan DRAFT milik Warga A
        Report.objects.create(
            title='Laporan Saya',
            category='Jalan',
            description='Ada lubang di depan rumah',
            location='Jl. Ahmad Yani',
            reporter=self.warga_a,
            status='DRAFT'
        )

        # Act
        response = self.client_a.get('/api/report/?tab=my_reports')

        # Assert
        self.assertEqual(response.status_code, 200)
        data = response.json()
        results = data.get('results', data)
        self.assertTrue(len(results) > 0)
        # Nama pelapor harus nama asli (username warga_a), BUKAN "Warga Anonim"
        for item in results:
            self.assertEqual(item['reporter'], self.warga_a.username)

    def test_PRIV03_citizen_tidak_bisa_GET_draf_orang_lain(self):
        """
        PRIV03: Warga A GET detail draf milik Warga B -> 404 Not Found.
        """
        # Act
        url = f'/api/report/{self.laporan_draft_b.id}/'
        response = self.client_a.get(url)

        # Assert: sistem menyembunyikan eksistensi draf asing
        self.assertEqual(response.status_code, 404)

    def test_PRIV04_citizen_tidak_bisa_PUT_draf_orang_lain(self):
        """
        PRIV04: Warga A PUT modifikasi draf milik Warga B -> 404, isi draf tidak berubah.
        """
        # Arrange
        url = f'/api/report/{self.laporan_draft_b.id}/'
        payload = {
            'title': 'Judul Diubah Warga A',
            'category': 'Sampah',
            'description': 'Deskripsi diubah',
            'location': 'Lokasi baru',
            'status': 'DRAFT'
        }

        # Act
        response = self.client_a.put(url, payload, format='json')

        # Assert: response 404
        self.assertEqual(response.status_code, 404)

        # Assert: isi draf di database TIDAK berubah
        self.laporan_draft_b.refresh_from_db()
        self.assertEqual(self.laporan_draft_b.title, 'Draft Rahasia B')
        self.assertEqual(self.laporan_draft_b.description, 'Isi draf rahasia')