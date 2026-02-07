from django.db import models

# Create your models here.
class DiaryEntry(models.Model):
    date = models.DateField()
    content = models.TextField()

    def __str__(self):
        return str(self.date)
