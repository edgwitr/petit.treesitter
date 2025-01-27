#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define MAX_NAME_LENGTH 50
#define MAX_PEOPLE 100

typedef struct {
    char name[MAX_NAME_LENGTH];
    int age;
    float height;
    float weight;
} Person;

void initialize_people(Person people[], int count) {
    for (int i = 0; i < count; i++) {
        snprintf(people[i].name, MAX_NAME_LENGTH, "Person_%d", i + 1);
        people[i].age = rand() % 100 + 1;
        people[i].height = (rand() % 50 + 150) / 100.0;
        people[i].weight = (rand() % 50 + 50) / 1.0;
    }
}

void display_people(const Person people[], int count) {
    for (int i = 0; i < count; i++) {
        printf("Name: %s, Age: %d, Height: %.2f m, Weight: %.2f kg\n",
               people[i].name, people[i].age, people[i].height, people[i].weight);
    }
}

void save_to_file(const Person people[], int count, const char *filename) {
    FILE *file = fopen(filename, "w");
    if (!file) {
        perror("Failed to open file");
        return;
    }

    fprintf(file, "Name,Age,Height,Weight\n");
    for (int i = 0; i < count; i++) {
        fprintf(file, "%s,%d,%.2f,%.2f\n",
                people[i].name, people[i].age, people[i].height, people[i].weight);
    }

    fclose(file);
}

void load_from_file(Person people[], int *count, const char *filename) {
    FILE *file = fopen(filename, "r");
    if (!file) {
        perror("Failed to open file");
        return;
    }

    char line[256];
    fgets(line, sizeof(line), file); // Skip header
    int index = 0;

    while (fgets(line, sizeof(line), file) && index < MAX_PEOPLE) {
        sscanf(line, "%49[^,],%d,%f,%f",
               people[index].name, &people[index].age,
               &people[index].height, &people[index].weight);
        index++;
    }

    *count = index;
    fclose(file);
}

int main() {
    srand((unsigned int)time(NULL));

    Person people[MAX_PEOPLE];
    int count = 10;

    initialize_people(people, count);
    printf("Generated People:\n");
    display_people(people, count);

    const char *filename = "people_data.csv";
    save_to_file(people, count, filename);
    printf("\nData saved to %s\n", filename);

    Person loaded_people[MAX_PEOPLE];
    int loaded_count = 0;
    load_from_file(loaded_people, &loaded_count, filename);

    printf("\nLoaded People:\n");
    display_people(loaded_people, loaded_count);

    return 0;
}
