from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages
from django.urls import reverse_lazy
from django.shortcuts import render, redirect

from .forms import RegisterForm


class UserLoginView(LoginView):
    template_name = 'registration/login.html'

    def form_valid(self, form):
        messages.success(self.request, 'Berhasil login')
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('home')


class UserLogoutView(LogoutView):
    next_page = reverse_lazy('login')

    def dispatch(self, request, *args, **kwargs):
        messages.success(request, 'Berhasil logout')
        return super().dispatch(request, *args, **kwargs)


def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)

        if form.is_valid():
            user = form.save(commit=False)
            user.is_admin = False
            user.is_member = True
            user.save()

            messages.success(request, 'Registrasi berhasil, silakan login.')
            return redirect('login')
    else:
        form = RegisterForm()

    return render(request, 'registration/register.html', {'form': form})