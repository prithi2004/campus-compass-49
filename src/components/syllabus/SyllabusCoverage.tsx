import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubjects } from "@/hooks/useSubjects";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Save,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface SyllabusCoverageRow {
  id: string;
  subject_id: string;
  unit_name: string;
  unit_number: number;
  total_topics: number;
  completed_topics: number;
  staff_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const SyllabusCoverage = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [newUnitName, setNewUnitName] = useState("");
  const [newTotalTopics, setNewTotalTopics] = useState(5);
  const queryClient = useQueryClient();

  const { data: subjects, isLoading: subjectsLoading } = useSubjects();

  const selectedSubject = subjects?.find((s: any) => s.id === selectedSubjectId);

  const { data: coverage, isLoading: coverageLoading } = useQuery({
    queryKey: ["syllabus-coverage", selectedSubjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("syllabus_coverage")
        .select("*")
        .eq("subject_id", selectedSubjectId)
        .order("unit_number");

      if (error) throw error;
      return data as SyllabusCoverageRow[];
    },
    enabled: !!selectedSubjectId,
  });

  const addUnitMutation = useMutation({
    mutationFn: async () => {
      const nextUnitNumber = (coverage?.length || 0) + 1;
      const { error } = await supabase.from("syllabus_coverage").insert({
        subject_id: selectedSubjectId,
        unit_name: newUnitName || `Unit ${nextUnitNumber}`,
        unit_number: nextUnitNumber,
        total_topics: newTotalTopics,
        completed_topics: 0,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus-coverage", selectedSubjectId] });
      setNewUnitName("");
      setNewTotalTopics(5);
      toast.success("Unit added successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateTopicsMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: number }) => {
      const { error } = await supabase
        .from("syllabus_coverage")
        .update({ completed_topics: completed, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus-coverage", selectedSubjectId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("syllabus_coverage").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus-coverage", selectedSubjectId] });
      toast.success("Unit removed");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const overallPercentage =
    coverage && coverage.length > 0
      ? Math.round(
          (coverage.reduce((sum, u) => sum + u.completed_topics, 0) /
            coverage.reduce((sum, u) => sum + u.total_topics, 0)) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Subject Selector */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-card-foreground">
              Syllabus Coverage
            </h3>
            <p className="text-sm text-muted-foreground">
              Select a subject to view and manage syllabus progress
            </p>
          </div>
        </div>

        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
          <SelectTrigger className="w-full md:w-96">
            <SelectValue placeholder="Select a subject..." />
          </SelectTrigger>
          <SelectContent>
            {subjectsLoading ? (
              <SelectItem value="loading" disabled>
                Loading subjects...
              </SelectItem>
            ) : subjects && subjects.length > 0 ? (
              subjects.map((subject: any) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                No subjects found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Coverage Details */}
      {selectedSubjectId && selectedSubject && (
        <>
          {/* Subject Info & Overall Progress */}
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-card-foreground">
                    {selectedSubject.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubject.code} • Semester {selectedSubject.semester}
                    {selectedSubject.course && ` • ${selectedSubject.course.name}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{overallPercentage}%</p>
                <p className="text-sm text-muted-foreground">Overall Coverage</p>
              </div>
            </div>
            <Progress value={overallPercentage} className="h-3" />
          </div>

          {/* Unit-wise Coverage */}
          <div className="glass-card p-6">
            <h4 className="text-lg font-heading font-semibold text-card-foreground mb-4">
              Unit-wise Coverage
            </h4>

            {coverageLoading ? (
              <p className="text-muted-foreground text-sm">Loading coverage data...</p>
            ) : coverage && coverage.length > 0 ? (
              <div className="space-y-4">
                {coverage.map((unit) => {
                  const pct = Math.round((unit.completed_topics / unit.total_topics) * 100);
                  return (
                    <div
                      key={unit.id}
                      className="p-4 rounded-lg border border-border bg-muted/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {pct === 100 ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className="font-medium text-card-foreground">
                            Unit {unit.unit_number}: {unit.unit_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">{pct}%</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => deleteUnitMutation.mutate(unit.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <Progress value={pct} className="h-2 mb-2" />
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {unit.completed_topics} / {unit.total_topics} topics completed
                        </span>
                        <div className="flex items-center gap-1 ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={unit.completed_topics <= 0}
                            onClick={() =>
                              updateTopicsMutation.mutate({
                                id: unit.id,
                                completed: unit.completed_topics - 1,
                              })
                            }
                          >
                            -
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={unit.completed_topics >= unit.total_topics}
                            onClick={() =>
                              updateTopicsMutation.mutate({
                                id: unit.id,
                                completed: unit.completed_topics + 1,
                              })
                            }
                          >
                            +
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={unit.completed_topics >= unit.total_topics}
                            onClick={() =>
                              updateTopicsMutation.mutate({
                                id: unit.id,
                                completed: unit.total_topics,
                              })
                            }
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Done
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No units added yet. Add units below to start tracking syllabus coverage.
              </p>
            )}

            {/* Add Unit */}
            <div className="mt-6 p-4 rounded-lg border border-dashed border-border">
              <h5 className="text-sm font-medium text-card-foreground mb-3">Add New Unit</h5>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Unit name (e.g. Introduction to Arrays)"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Total topics"
                  value={newTotalTopics}
                  onChange={(e) => setNewTotalTopics(Number(e.target.value))}
                  className="w-32"
                  min={1}
                />
                <Button
                  onClick={() => addUnitMutation.mutate()}
                  disabled={addUnitMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Unit
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SyllabusCoverage;
